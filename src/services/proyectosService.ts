import { db, guardarDb, nuevoId } from '@/mocks/db';
import type { EstadoProyecto, FiltrosProyectos, Proyecto, ProyectoPayload, ProyectoResumen } from '@/types/proyecto';
import type { Usuario } from '@/types/usuario';
import { coincide } from '@/utils/texto';
import { emitirCambio } from './eventos';
import { clonar, delay, ServiceError } from './mockDelay';

function porId(id: string): Proyecto {
  const p = db.proyectos.find((x) => x.id === id);
  if (!p) throw new ServiceError('Proyecto no encontrado', 404);
  return p;
}

function resumir(p: Proyecto): ProyectoResumen {
  const tipo = db.tiposTE.find((t) => t.id === p.tipoTEId);
  const docs = db.documentos.filter((d) => d.proyectoId === p.id);
  const requeridos = tipo?.documentosRequeridos.filter((r) => r.obligatorio) ?? [];
  return {
    ...p,
    tipoTECodigo: tipo?.codigo ?? '—',
    tipoTENombre: tipo?.nombre ?? 'Tipo eliminado',
    responsableNombre: db.usuarios.find((u) => u.id === p.usuarioId)?.nombre ?? '—',
    docsRequeridos: requeridos.length,
    docsCargados: requeridos.filter((r) => docs.some((d) => d.requisitoId === r.id)).length,
    totalDocumentos: docs.length,
  };
}

/** El admin ve todos los proyectos; el eléctrico solo los suyos. */
function visibles(usuario: Usuario): Proyecto[] {
  return usuario.rol === 'admin' ? db.proyectos : db.proyectos.filter((p) => p.usuarioId === usuario.id);
}

function tocar(p: Proyecto) {
  p.fechaActualizacion = new Date().toISOString();
}

export const proyectosService = {
  async listar(usuario: Usuario, filtros: FiltrosProyectos = {}): Promise<ProyectoResumen[]> {
    await delay(200);
    return clonar(
      visibles(usuario)
        .map(resumir)
        .filter((p) => !filtros.tipoTEId || p.tipoTEId === filtros.tipoTEId)
        .filter((p) => !filtros.estado || p.estado === filtros.estado)
        .filter((p) => !filtros.q || coincide(filtros.q, p.nombre, p.codigo, p.cliente.nombre, p.comuna, p.direccion, p.tipoTECodigo))
        .sort((a, b) => b.fechaActualizacion.localeCompare(a.fechaActualizacion)),
    );
  },

  /** Conteo por estado (para los filtros), sin aplicar el filtro de estado. */
  async contarPorEstado(usuario: Usuario): Promise<Record<EstadoProyecto, number>> {
    await delay(100);
    const base: Record<EstadoProyecto, number> = { borrador: 0, en_desarrollo: 0, listo_para_declarar: 0, declarado: 0 };
    visibles(usuario).forEach((p) => base[p.estado]++);
    return base;
  },

  async obtener(id: string): Promise<ProyectoResumen> {
    await delay(150);
    return clonar(resumir(porId(id)));
  },

  async crear(usuarioId: string, payload: ProyectoPayload): Promise<Proyecto> {
    await delay(500);
    const ahora = new Date();
    const correlativo = Math.max(0, ...db.proyectos.map((p) => Number(p.codigo.split('-').pop()) || 0)) + 1;
    const proyecto: Proyecto = {
      ...clonar(payload),
      id: nuevoId('pry'),
      codigo: `PRY-${ahora.getFullYear()}-${String(correlativo).padStart(3, '0')}`,
      usuarioId,
      estado: 'borrador',
      fechaCreacion: ahora.toISOString(),
      fechaActualizacion: ahora.toISOString(),
      checklistApoyo: [],
    };
    db.proyectos.push(proyecto);
    guardarDb();
    emitirCambio('proyectos');
    return clonar(proyecto);
  },

  async actualizar(id: string, payload: Partial<ProyectoPayload>): Promise<Proyecto> {
    await delay(400);
    const p = porId(id);
    Object.assign(p, clonar(payload));
    tocar(p);
    guardarDb();
    emitirCambio('proyectos');
    return clonar(p);
  },

  async cambiarEstado(id: string, estado: EstadoProyecto, declaracion?: { folioSec: string; fecha: string }): Promise<Proyecto> {
    await delay(400);
    const p = porId(id);
    if (estado === 'declarado') {
      if (!declaracion?.folioSec.trim()) throw new ServiceError('Ingresa el folio de la declaración SEC');
      p.folioSec = declaracion.folioSec.trim();
      p.fechaDeclaracion = new Date(declaracion.fecha).toISOString();
    } else {
      p.folioSec = undefined;
      p.fechaDeclaracion = undefined;
    }
    p.estado = estado;
    tocar(p);
    guardarDb();
    emitirCambio('proyectos');
    return clonar(p);
  },

  async alternarRequisito(id: string, requisitoId: string): Promise<string[]> {
    const p = porId(id);
    p.checklistApoyo = p.checklistApoyo.includes(requisitoId)
      ? p.checklistApoyo.filter((r) => r !== requisitoId)
      : [...p.checklistApoyo, requisitoId];
    guardarDb();
    return [...p.checklistApoyo];
  },

  async eliminar(id: string): Promise<void> {
    await delay(400);
    porId(id);
    db.proyectos = db.proyectos.filter((p) => p.id !== id);
    db.documentos = db.documentos.filter((d) => d.proyectoId !== id);
    guardarDb();
    emitirCambio('proyectos');
  },
};
