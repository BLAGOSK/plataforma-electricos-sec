import type { ArchivoAdjunto, ID, ISODate } from './common';

export type Modalidad = 'videollamada' | 'presencial';

export type DisponibilidadAsesor = 'disponible' | 'pocos_cupos' | 'sin_cupos';

/** Bloque de atención semanal. diaSemana: 1 = lunes … 6 = sábado. Horas "HH:mm". */
export interface BloqueHorario {
  diaSemana: number;
  inicio: string;
  fin: string;
}

export interface Asesor {
  id: ID;
  nombre: string;
  titulo: string;
  email: string;
  bio: string;
  especialidades: string[];
  /** Tipos TE en los que tiene experiencia */
  tiposTE: ID[];
  aniosExperiencia: number;
  region: string;
  comuna: string;
  modalidades: Modalidad[];
  /** Valor referencial por hora en CLP */
  tarifaHora: number;
  calificacion: number;
  totalResenas: number;
  horario: BloqueHorario[];
  activo: boolean;
}

export interface Resena {
  id: ID;
  asesorId: ID;
  usuarioId: ID;
  usuarioNombre: string;
  reunionId?: ID;
  calificacion: number;
  comentario: string;
  aspectos: string[];
  fecha: ISODate;
}

export type EstadoSolicitudAsesoria = 'enviada' | 'aceptada' | 'rechazada';

export interface SolicitudAsesoria {
  id: ID;
  usuarioId: ID;
  asesorId: ID;
  proyectoId?: ID;
  asunto: string;
  descripcion: string;
  modalidadPreferida: Modalidad;
  adjuntos: ArchivoAdjunto[];
  estado: EstadoSolicitudAsesoria;
  fecha: ISODate;
  conversacionId: ID;
}

export type EstadoReunion = 'agendada' | 'finalizada' | 'cancelada';

export interface Reunion {
  id: ID;
  usuarioId: ID;
  asesorId: ID;
  proyectoId?: ID;
  tema: string;
  fechaInicio: ISODate;
  duracionMin: number;
  modalidad: Modalidad;
  /** Solo para modalidad presencial */
  direccion?: string;
  estado: EstadoReunion;
  calificada: boolean;
}

export interface SlotDisponible {
  inicio: ISODate;
  disponible: boolean;
}

export interface DiaDisponible {
  /** "YYYY-MM-DD" (hora local) */
  fecha: string;
  slots: SlotDisponible[];
}

export interface Conversacion {
  id: ID;
  usuarioId: ID;
  asesorId: ID;
  proyectoId?: ID;
  asunto: string;
  /** Mensajes del asesor no leídos por el usuario */
  noLeidos: number;
  actualizada: ISODate;
}

export interface Mensaje {
  id: ID;
  conversacionId: ID;
  autor: 'usuario' | 'asesor';
  texto: string;
  adjuntos: ArchivoAdjunto[];
  fecha: ISODate;
}

export interface ConversacionResumen extends Conversacion {
  asesorNombre: string;
  ultimoMensaje?: Mensaje;
}

export interface NuevaReunionPayload {
  asesorId: ID;
  proyectoId?: ID;
  tema: string;
  fechaInicio: ISODate;
  modalidad: Modalidad;
  direccion?: string;
}

export interface NuevaSolicitudPayload {
  asesorId: ID;
  proyectoId?: ID;
  asunto: string;
  descripcion: string;
  modalidadPreferida: Modalidad;
  adjuntos: File[];
}

export type AsesorPayload = Omit<Asesor, 'id' | 'calificacion' | 'totalResenas'>;
