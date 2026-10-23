import { db, guardarDb, nuevoId } from '@/mocks/db';
import type {
  Asesor,
  AsesorPayload,
  DiaDisponible,
  DisponibilidadAsesor,
  Modalidad,
  NuevaReunionPayload,
  NuevaSolicitudPayload,
  Resena,
  Reunion,
  SolicitudAsesoria,
} from '@/types/asesoria';
import { coincide } from '@/utils/texto';
import { archivoDesdeFile } from './archivos';
import { emitirCambio } from './eventos';
import { clonar, delay, ServiceError } from './mockDelay';
import { notificacionesService } from './notificacionesService';

export interface AsesorConDisponibilidad extends Asesor {
  disponibilidad: DisponibilidadAsesor;
  /** Primer bloque libre (ISO) */
  proximoBloque?: string;
}

export interface FiltrosAsesores {
  q?: string;
  especialidad?: string;
  tipoTEId?: string;
  modalidad?: Modalidad;
  soloDisponibles?: boolean;
  orden?: 'calificacion' | 'experiencia' | 'tarifa';
}

export interface ReunionDetalle extends Reunion {
  asesorNombre: string;
  proyectoNombre?: string;
}

const DIAS_AGENDA = 21;
const DURACION_SLOT_MIN = 60;

function asesorPorId(id: string): Asesor {
  const a = db.asesores.find((x) => x.id === id);
  if (!a) throw new ServiceError('Asesor no encontrado', 404);
  return a;
}

/** La calificación se calcula siempre a partir de las reseñas. */
function conCalificacion(a: Asesor): Asesor {
  const resenas = db.resenas.filter((r) => r.asesorId === a.id);
  const promedio = resenas.length ? resenas.reduce((s, r) => s + r.calificacion, 0) / resenas.length : 0;
  return { ...a, calificacion: Math.round(promedio * 10) / 10, totalResenas: resenas.length };
}

function fechaLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Ocupación pseudoaleatoria estable para que la agenda se vea realista. */
function ocupadoSimulado(asesorId: string, iso: string): boolean {
  const hash = [...(asesorId + iso)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return hash % 4 === 0;
}

function calcularDisponibilidad(asesor: Asesor, dias = DIAS_AGENDA): DiaDisponible[] {
  const resultado: DiaDisponible[] = [];
  const ahora = Date.now();
  const reservas = db.reuniones.filter((r) => r.asesorId === asesor.id && r.estado === 'agendada').map((r) => new Date(r.fechaInicio).getTime());

  for (let i = 0; i < dias; i++) {
    const dia = new Date();
    dia.setHours(0, 0, 0, 0);
    dia.setDate(dia.getDate() + i);
    const bloques = asesor.horario.filter((b) => b.diaSemana === dia.getDay());
    if (!bloques.length) continue;
    const slots = bloques.flatMap((b) => {
      const [hi, mi] = b.inicio.split(':').map(Number);
      const [hf, mf] = b.fin.split(':').map(Number);
      const lista = [];
      for (let min = hi! * 60 + mi!; min + DURACION_SLOT_MIN <= hf! * 60 + mf!; min += DURACION_SLOT_MIN) {
        const inicio = new Date(dia);
        inicio.setHours(Math.floor(min / 60), min % 60);
        const t = inicio.getTime();
        const iso = inicio.toISOString();
        lista.push({ inicio: iso, disponible: t > ahora + 2 * 3_600_000 && !reservas.includes(t) && !ocupadoSimulado(asesor.id, iso) });
      }
      return lista;
    });
    resultado.push({ fecha: fechaLocal(dia), slots });
  }
  return resultado;
}

function conDisponibilidad(a: Asesor): AsesorConDisponibilidad {
  const libres = calcularDisponibilidad(a, 14).flatMap((d) => d.slots.filter((s) => s.disponible));
  const disponibilidad: DisponibilidadAsesor = libres.length === 0 ? 'sin_cupos' : libres.length < 6 ? 'pocos_cupos' : 'disponible';
  return { ...conCalificacion(a), disponibilidad, proximoBloque: libres[0]?.inicio };
}

function detalleReunion(r: Reunion): ReunionDetalle {
  return {
    ...r,
    asesorNombre: db.asesores.find((a) => a.id === r.asesorId)?.nombre ?? 'Asesor',
    proyectoNombre: r.proyectoId ? db.proyectos.find((p) => p.id === r.proyectoId)?.nombre : undefined,
  };
}

function reunionPorId(id: string): Reunion {
  const r = db.reuniones.find((x) => x.id === id);
  if (!r) throw new ServiceError('Reunión no encontrada', 404);
  return r;
}

export const asesoriasService = {
  // ---- Directorio ----

  async listarAsesores(filtros: FiltrosAsesores = {}): Promise<AsesorConDisponibilidad[]> {
    await delay(200);
    const lista = db.asesores
      .filter((a) => a.activo)
      .map(conDisponibilidad)
      .filter((a) => !filtros.q || coincide(filtros.q, a.nombre, a.titulo, a.especialidades.join(' '), a.comuna))
      .filter((a) => !filtros.especialidad || a.especialidades.includes(filtros.especialidad))
      .filter((a) => !filtros.tipoTEId || a.tiposTE.includes(filtros.tipoTEId))
      .filter((a) => !filtros.modalidad || a.modalidades.includes(filtros.modalidad))
      .filter((a) => !filtros.soloDisponibles || a.disponibilidad !== 'sin_cupos');
    const orden = filtros.orden ?? 'calificacion';
    lista.sort((a, b) =>
      orden === 'experiencia' ? b.aniosExperiencia - a.aniosExperiencia : orden === 'tarifa' ? a.tarifaHora - b.tarifaHora : b.calificacion - a.calificacion,
    );
    return clonar(lista);
  },

  async especialidades(): Promise<string[]> {
    await delay(50);
    return [...new Set(db.asesores.flatMap((a) => a.especialidades))].sort((a, b) => a.localeCompare(b, 'es'));
  },

  async obtenerAsesor(id: string): Promise<AsesorConDisponibilidad> {
    await delay(150);
    return clonar(conDisponibilidad(asesorPorId(id)));
  },

  async resenas(asesorId: string): Promise<Resena[]> {
    await delay(150);
    return clonar(db.resenas.filter((r) => r.asesorId === asesorId).sort((a, b) => b.fecha.localeCompare(a.fecha)));
  },

  async disponibilidad(asesorId: string): Promise<DiaDisponible[]> {
    await delay(200);
    return clonar(calcularDisponibilidad(asesorPorId(asesorId)));
  },

  // ---- Solicitudes ----

  async solicitar(usuarioId: string, payload: NuevaSolicitudPayload): Promise<SolicitudAsesoria> {
    await delay(500);
    const asesor = asesorPorId(payload.asesorId);
    const ahora = new Date().toISOString();
    const conversacionId = nuevoId('conv');
    const adjuntos = payload.adjuntos.map(archivoDesdeFile);
    const solicitud: SolicitudAsesoria = {
      id: nuevoId('sas'),
      usuarioId,
      asesorId: asesor.id,
      proyectoId: payload.proyectoId,
      asunto: payload.asunto.trim(),
      descripcion: payload.descripcion.trim(),
      modalidadPreferida: payload.modalidadPreferida,
      adjuntos,
      estado: 'enviada',
      fecha: ahora,
      conversacionId,
    };
    db.solicitudesAsesoria.push(solicitud);
    // La solicitud abre una conversación con el asesor.
    db.conversaciones.push({ id: conversacionId, usuarioId, asesorId: asesor.id, proyectoId: payload.proyectoId, asunto: solicitud.asunto, noLeidos: 0, actualizada: ahora });
    db.mensajes.push({
      id: nuevoId('msg'),
      conversacionId,
      autor: 'usuario',
      texto: `Solicitud de asesoría (${payload.modalidadPreferida === 'videollamada' ? 'videollamada' : 'presencial'}): ${solicitud.asunto}\n\n${solicitud.descripcion}`,
      adjuntos,
      fecha: ahora,
    });
    guardarDb();
    emitirCambio('asesorias', 'chat');

    // El asesor "acepta" la solicitud al poco tiempo (simulación).
    setTimeout(() => {
      solicitud.estado = 'aceptada';
      const conv = db.conversaciones.find((c) => c.id === conversacionId);
      const fecha = new Date().toISOString();
      db.mensajes.push({
        id: nuevoId('msg'),
        conversacionId,
        autor: 'asesor',
        texto: `Hola, gracias por tu solicitud. Acepto la asesoría. Puedes agendar una reunión en los horarios disponibles de mi calendario.`,
        adjuntos: [],
        fecha,
      });
      if (conv) {
        conv.actualizada = fecha;
        conv.noLeidos += 1;
      }
      guardarDb();
      notificacionesService.crear({
        usuarioId,
        tipo: 'exito',
        titulo: 'Solicitud de asesoría aceptada',
        mensaje: `${asesor.nombre} aceptó tu solicitud "${solicitud.asunto}".`,
        enlace: `/asesorias/chat/${conversacionId}`,
      });
      emitirCambio('asesorias', 'chat');
    }, 4000);

    return clonar(solicitud);
  },

  // ---- Reuniones ----

  async listarReuniones(usuarioId: string): Promise<ReunionDetalle[]> {
    await delay(200);
    return clonar(db.reuniones.filter((r) => r.usuarioId === usuarioId).map(detalleReunion).sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio)));
  },

  async obtenerReunion(id: string): Promise<ReunionDetalle> {
    await delay(120);
    return clonar(detalleReunion(reunionPorId(id)));
  },

  async agendar(usuarioId: string, payload: NuevaReunionPayload): Promise<Reunion> {
    await delay(500);
    const asesor = asesorPorId(payload.asesorId);
    if (!asesor.modalidades.includes(payload.modalidad)) throw new ServiceError('El asesor no ofrece esta modalidad');
    if (payload.modalidad === 'presencial' && !payload.direccion?.trim()) throw new ServiceError('Indica la dirección de la reunión presencial');
    const libre = calcularDisponibilidad(asesor)
      .flatMap((d) => d.slots)
      .some((s) => s.inicio === payload.fechaInicio && s.disponible);
    if (!libre) throw new ServiceError('El bloque seleccionado ya no está disponible', 409);

    const reunion: Reunion = {
      id: nuevoId('reu'),
      usuarioId,
      asesorId: asesor.id,
      proyectoId: payload.proyectoId,
      tema: payload.tema.trim(),
      fechaInicio: payload.fechaInicio,
      duracionMin: DURACION_SLOT_MIN,
      modalidad: payload.modalidad,
      direccion: payload.modalidad === 'presencial' ? payload.direccion!.trim() : undefined,
      estado: 'agendada',
      calificada: false,
    };
    db.reuniones.push(reunion);
    guardarDb();
    notificacionesService.crear({
      usuarioId,
      tipo: 'exito',
      titulo: 'Reunión agendada',
      mensaje: `${reunion.modalidad === 'videollamada' ? 'Videollamada' : 'Reunión presencial'} con ${asesor.nombre}.`,
      enlace: '/asesorias/reuniones',
    });
    emitirCambio('asesorias');
    return clonar(reunion);
  },

  async cancelar(reunionId: string): Promise<void> {
    await delay(300);
    const r = reunionPorId(reunionId);
    if (r.estado !== 'agendada') throw new ServiceError('Solo se pueden cancelar reuniones agendadas');
    r.estado = 'cancelada';
    guardarDb();
    emitirCambio('asesorias');
  },

  /** Se usa al cerrar la videollamada (en la Fase 2 lo hará el backend). */
  async finalizar(reunionId: string): Promise<void> {
    await delay(200);
    const r = reunionPorId(reunionId);
    if (r.estado === 'agendada') r.estado = 'finalizada';
    guardarDb();
    emitirCambio('asesorias');
  },

  async calificar(usuarioId: string, reunionId: string, calificacion: number, comentario: string, aspectos: string[]): Promise<Resena> {
    await delay(400);
    const r = reunionPorId(reunionId);
    if (r.estado !== 'finalizada') throw new ServiceError('Solo puedes calificar reuniones finalizadas');
    if (r.calificada) throw new ServiceError('Esta asesoría ya fue calificada', 409);
    if (calificacion < 1 || calificacion > 5) throw new ServiceError('Selecciona entre 1 y 5 estrellas');
    const usuario = db.usuarios.find((u) => u.id === usuarioId);
    const partes = (usuario?.nombre ?? 'Usuario').split(' ');
    const resena: Resena = {
      id: nuevoId('res'),
      asesorId: r.asesorId,
      usuarioId,
      usuarioNombre: `${partes[0]} ${partes[1]?.[0] ?? ''}.`.trim(),
      reunionId,
      calificacion,
      comentario: comentario.trim(),
      aspectos,
      fecha: new Date().toISOString(),
    };
    db.resenas.push(resena);
    r.calificada = true;
    guardarDb();
    emitirCambio('asesorias');
    return clonar(resena);
  },

  // ---- Administración ----

  async listarTodos(): Promise<Asesor[]> {
    await delay(150);
    return clonar(db.asesores.map(conCalificacion));
  },

  async crearAsesor(payload: AsesorPayload): Promise<Asesor> {
    await delay(400);
    const asesor: Asesor = { ...clonar(payload), id: nuevoId('as'), calificacion: 0, totalResenas: 0 };
    db.asesores.push(asesor);
    guardarDb();
    emitirCambio('asesorias');
    return clonar(asesor);
  },

  async actualizarAsesor(id: string, payload: AsesorPayload): Promise<Asesor> {
    await delay(400);
    const a = asesorPorId(id);
    Object.assign(a, clonar(payload));
    guardarDb();
    emitirCambio('asesorias');
    return clonar(conCalificacion(a));
  },

  async eliminarAsesor(id: string): Promise<void> {
    await delay(300);
    if (db.reuniones.some((r) => r.asesorId === id && r.estado === 'agendada')) {
      throw new ServiceError('El asesor tiene reuniones agendadas. Desactívalo en su lugar.', 409);
    }
    db.asesores = db.asesores.filter((a) => a.id !== id);
    guardarDb();
    emitirCambio('asesorias');
  },
};
