/**
 * Base de datos simulada en memoria, persistida en localStorage para que las
 * acciones de la demo (aprobar usuarios, subir revisiones, etc.) se mantengan
 * al navegar o recargar. SOLO la usan los archivos de src/services.
 */
import type { DocumentoNormativo, Video } from '@/types/aprendizaje';
import type { Asesor, Conversacion, Mensaje, Resena, Reunion, SolicitudAsesoria } from '@/types/asesoria';
import type { Documento } from '@/types/documento';
import type { SolicitudExtension, Extension } from '@/types/extension';
import type { Notificacion } from '@/types/notificacion';
import type { Proyecto } from '@/types/proyecto';
import type { TipoTE } from '@/types/tipoTE';
import type { PreferenciasNotificacion, Usuario } from '@/types/usuario';
import { documentosNormativosSeed, videosSeed } from './aprendizaje';
import {
  asesoresSeed,
  conversacionesSeed,
  mensajesSeed,
  resenasSeed,
  reunionesSeed,
  solicitudesAsesoriaSeed,
} from './asesorias';
import { documentosSeed } from './documentos';
import { extensionesSeed, solicitudesExtensionSeed } from './extensiones';
import { notificacionesSeed } from './notificaciones';
import { proyectosSeed } from './proyectos';
import { tiposTESeed } from './tiposTE';
import { credencialesSeed, usuariosSeed } from './usuarios';

export interface MockDb {
  usuarios: Usuario[];
  /** usuarioId → contraseña (solo para la demo; la API real usará hash) */
  credenciales: Record<string, string>;
  preferencias: Record<string, PreferenciasNotificacion>;
  notificaciones: Notificacion[];
  extensiones: Extension[];
  solicitudesExtension: SolicitudExtension[];
  tiposTE: TipoTE[];
  proyectos: Proyecto[];
  documentos: Documento[];
  documentosNormativos: DocumentoNormativo[];
  videos: Video[];
  asesores: Asesor[];
  resenas: Resena[];
  reuniones: Reunion[];
  solicitudesAsesoria: SolicitudAsesoria[];
  conversaciones: Conversacion[];
  mensajes: Mensaje[];
}

const STORAGE_KEY = 'sec-demo-db-v1';

function crearSeed(): MockDb {
  return structuredClone({
    usuarios: usuariosSeed,
    credenciales: credencialesSeed,
    preferencias: {},
    notificaciones: notificacionesSeed,
    extensiones: extensionesSeed,
    solicitudesExtension: solicitudesExtensionSeed,
    tiposTE: tiposTESeed,
    proyectos: proyectosSeed,
    documentos: documentosSeed,
    documentosNormativos: documentosNormativosSeed,
    videos: videosSeed,
    asesores: asesoresSeed,
    resenas: resenasSeed,
    reuniones: reunionesSeed,
    solicitudesAsesoria: solicitudesAsesoriaSeed,
    conversaciones: conversacionesSeed,
    mensajes: mensajesSeed,
  });
}

function cargar(): MockDb {
  const seed = crearSeed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // Las colecciones nuevas que no estén en lo guardado se toman del seed.
    if (raw) return { ...seed, ...(JSON.parse(raw) as Partial<MockDb>) };
  } catch {
    /* localStorage no disponible o datos corruptos: se usa el seed */
  }
  return seed;
}

export const db: MockDb = cargar();

export function guardarDb(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* sin persistencia: la demo sigue funcionando en memoria */
  }
}

/** Restablece todos los datos de la demo a su estado inicial. */
export function restablecerDb(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignorar */
  }
  Object.assign(db, crearSeed());
}

export function nuevoId(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
