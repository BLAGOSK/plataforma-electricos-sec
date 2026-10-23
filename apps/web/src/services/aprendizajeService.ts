import { db, guardarDb, nuevoId } from '@/mocks/db';
import type {
  DocumentoNormativo,
  DocumentoNormativoPayload,
  FiltrosAprendizaje,
  Video,
  VideoPayload,
} from '@/types/aprendizaje';
import { coincide } from '@/utils/texto';
import { archivoDesdeFile } from './archivos';
import { emitirCambio } from './eventos';
import { clonar, delay, ServiceError } from './mockDelay';

function docPorId(id: string): DocumentoNormativo {
  const d = db.documentosNormativos.find((x) => x.id === id);
  if (!d) throw new ServiceError('Documento no encontrado', 404);
  return d;
}

function videoPorId(id: string): Video {
  const v = db.videos.find((x) => x.id === id);
  if (!v) throw new ServiceError('Video no encontrado', 404);
  return v;
}

/** Convierte un enlace de YouTube/Vimeo en URL de inserción. Devuelve undefined si no se reconoce. */
export function aEmbedUrl(url: string): string | undefined {
  const u = url.trim();
  if (!u) return undefined;
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return undefined;
}

export const aprendizajeService = {
  // ---- Biblioteca normativa ----

  async listarDocumentos(filtros: FiltrosAprendizaje = {}): Promise<DocumentoNormativo[]> {
    await delay(180);
    return clonar(
      db.documentosNormativos
        .filter((d) => !filtros.tipoTEId || d.tiposTE.includes(filtros.tipoTEId))
        .filter((d) => !filtros.categoria || d.categoria === filtros.categoria)
        .filter((d) => !filtros.q || coincide(filtros.q, d.codigo, d.titulo, d.descripcion))
        .sort((a, b) => a.codigo.localeCompare(b.codigo, 'es', { numeric: true })),
    );
  },

  async obtenerDocumento(id: string): Promise<DocumentoNormativo> {
    await delay(120);
    return clonar(docPorId(id));
  },

  async crearDocumento(payload: DocumentoNormativoPayload, archivo: File): Promise<DocumentoNormativo> {
    await delay(500);
    const doc: DocumentoNormativo = {
      ...clonar(payload),
      id: nuevoId('norm'),
      archivo: archivoDesdeFile(archivo),
      fechaActualizacion: new Date().toISOString(),
    };
    db.documentosNormativos.push(doc);
    guardarDb();
    emitirCambio('contenidos');
    return clonar(doc);
  },

  /** Edita metadatos y, opcionalmente, reemplaza el archivo (nueva versión). */
  async actualizarDocumento(id: string, payload: DocumentoNormativoPayload, archivoNuevo?: File): Promise<DocumentoNormativo> {
    await delay(500);
    const doc = docPorId(id);
    Object.assign(doc, clonar(payload), { fechaActualizacion: new Date().toISOString() });
    if (archivoNuevo) doc.archivo = archivoDesdeFile(archivoNuevo);
    guardarDb();
    emitirCambio('contenidos');
    return clonar(doc);
  },

  async eliminarDocumento(id: string): Promise<void> {
    await delay(300);
    docPorId(id);
    db.documentosNormativos = db.documentosNormativos.filter((d) => d.id !== id);
    guardarDb();
    emitirCambio('contenidos');
  },

  // ---- Videos ----

  async listarVideos(filtros: FiltrosAprendizaje = {}): Promise<Video[]> {
    await delay(180);
    return clonar(
      db.videos
        .filter((v) => !filtros.tipoTEId || v.tiposTE.includes(filtros.tipoTEId))
        .filter((v) => !filtros.categoria || v.categoria === filtros.categoria)
        .filter((v) => !filtros.q || coincide(filtros.q, v.titulo, v.descripcion, v.autor))
        .sort((a, b) => b.fechaPublicacion.localeCompare(a.fechaPublicacion)),
    );
  },

  async obtenerVideo(id: string): Promise<Video> {
    await delay(120);
    return clonar(videoPorId(id));
  },

  async crearVideo(payload: VideoPayload, materiales: File[] = []): Promise<Video> {
    await delay(500);
    const video: Video = { ...clonar(payload), id: nuevoId('vid'), materiales: materiales.map(archivoDesdeFile) };
    db.videos.push(video);
    guardarDb();
    emitirCambio('contenidos');
    return clonar(video);
  },

  async actualizarVideo(id: string, payload: VideoPayload, materialesNuevos: File[] = [], materialesQuitados: string[] = []): Promise<Video> {
    await delay(500);
    const video = videoPorId(id);
    Object.assign(video, clonar(payload));
    video.materiales = [...video.materiales.filter((m) => !materialesQuitados.includes(m.id)), ...materialesNuevos.map(archivoDesdeFile)];
    guardarDb();
    emitirCambio('contenidos');
    return clonar(video);
  },

  async eliminarVideo(id: string): Promise<void> {
    await delay(300);
    videoPorId(id);
    db.videos = db.videos.filter((v) => v.id !== id);
    guardarDb();
    emitirCambio('contenidos');
  },
};
