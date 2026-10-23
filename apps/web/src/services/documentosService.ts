import { db, guardarDb, nuevoId } from '@/mocks/db';
import type { Documento, EsquemaRevision, NuevaRevisionPayload, NuevoDocumentoPayload } from '@/types/documento';
import { archivoDesdeFile } from './archivos';
import { emitirCambio } from './eventos';
import { clonar, delay, ServiceError } from './mockDelay';

function porId(id: string): Documento {
  const d = db.documentos.find((x) => x.id === id);
  if (!d) throw new ServiceError('Documento no encontrado', 404);
  return d;
}

function nombreAutor(usuarioId: string): string {
  return db.usuarios.find((u) => u.id === usuarioId)?.nombre ?? 'Usuario';
}

function tocarProyecto(proyectoId: string) {
  const p = db.proyectos.find((x) => x.id === proyectoId);
  if (p) {
    p.fechaActualizacion = new Date().toISOString();
    // Subir documentación a un borrador lo pasa a "en desarrollo".
    if (p.estado === 'borrador') p.estado = 'en_desarrollo';
  }
}

/** Revisión inicial según el esquema: "A" o "0". */
export function revisionInicial(esquema: EsquemaRevision): string {
  return esquema === 'letras' ? 'A' : '0';
}

/** Siguiente revisión sugerida: A→B…Z→AA, 0→1… */
export function siguienteRevision(esquema: EsquemaRevision, actual?: string): string {
  if (!actual) return revisionInicial(esquema);
  if (esquema === 'numeros') return String((Number(actual) || 0) + 1);
  const letras = actual.toUpperCase().split('');
  let i = letras.length - 1;
  while (i >= 0) {
    if (letras[i] !== 'Z') {
      letras[i] = String.fromCharCode(letras[i]!.charCodeAt(0) + 1);
      return letras.join('');
    }
    letras[i] = 'A';
    i--;
  }
  return 'A' + letras.join('');
}

export function revisionValida(esquema: EsquemaRevision, numero: string): boolean {
  return esquema === 'letras' ? /^[A-Z]{1,2}$/.test(numero) : /^\d{1,3}$/.test(numero);
}

export const documentosService = {
  async listarPorProyecto(proyectoId: string): Promise<Documento[]> {
    await delay(150);
    return clonar(db.documentos.filter((d) => d.proyectoId === proyectoId));
  },

  async obtener(id: string): Promise<Documento> {
    await delay(120);
    return clonar(porId(id));
  },

  async crear(proyectoId: string, usuarioId: string, payload: NuevoDocumentoPayload): Promise<Documento> {
    await delay(600);
    const numero = payload.numeroRevision.trim().toUpperCase();
    if (!revisionValida(payload.esquemaRevision, numero)) throw new ServiceError('Número de revisión no válido');
    const ahora = new Date().toISOString();
    const documento: Documento = {
      id: nuevoId('doc'),
      proyectoId,
      nombre: payload.nombre.trim(),
      categoria: payload.categoria,
      requisitoId: payload.requisitoId || undefined,
      esquemaRevision: payload.esquemaRevision,
      fechaCreacion: ahora,
      revisiones: [
        {
          id: nuevoId('rev'),
          numero,
          comentario: payload.comentario.trim() || 'Emisión inicial.',
          archivo: archivoDesdeFile(payload.archivo),
          fecha: ahora,
          autorNombre: nombreAutor(usuarioId),
        },
      ],
    };
    db.documentos.push(documento);
    tocarProyecto(proyectoId);
    guardarDb();
    emitirCambio('proyectos');
    return clonar(documento);
  },

  async subirRevision(documentoId: string, usuarioId: string, payload: NuevaRevisionPayload): Promise<Documento> {
    await delay(600);
    const doc = porId(documentoId);
    const numero = payload.numero.trim().toUpperCase();
    if (!revisionValida(doc.esquemaRevision, numero)) throw new ServiceError('Número de revisión no válido');
    if (doc.revisiones.some((r) => r.numero === numero)) {
      throw new ServiceError(`La revisión ${numero} ya existe para este documento`, 409);
    }
    if (!payload.comentario.trim()) throw new ServiceError('Describe los cambios de esta revisión');
    doc.revisiones.push({
      id: nuevoId('rev'),
      numero,
      comentario: payload.comentario.trim(),
      archivo: archivoDesdeFile(payload.archivo),
      fecha: new Date().toISOString(),
      autorNombre: nombreAutor(usuarioId),
    });
    tocarProyecto(doc.proyectoId);
    guardarDb();
    emitirCambio('proyectos');
    return clonar(doc);
  },

  async eliminar(documentoId: string): Promise<void> {
    await delay(300);
    const doc = porId(documentoId);
    db.documentos = db.documentos.filter((d) => d.id !== documentoId);
    tocarProyecto(doc.proyectoId);
    guardarDb();
    emitirCambio('proyectos');
  },
};
