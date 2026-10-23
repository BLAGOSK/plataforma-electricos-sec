import { db, guardarDb, nuevoId } from '@/mocks/db';
import type { Conversacion, ConversacionResumen, Mensaje } from '@/types/asesoria';
import { archivoDesdeFile } from './archivos';
import { emitirCambio } from './eventos';
import { clonar, delay, ServiceError } from './mockDelay';

/** Conversaciones en las que el asesor "está escribiendo" (respuesta simulada). */
const escribiendo = new Set<string>();

const respuestasSimuladas = [
  'Gracias por la información. Déjame revisarlo y te comento.',
  'Buena pregunta. Según el pliego RIC correspondiente, conviene verificar primero la sección del alimentador.',
  'Recibido. ¿Puedes enviarme también el diagrama unilineal actualizado?',
  'Entiendo. Lo vemos con más detalle en nuestra próxima reunión, si te parece.',
  'Perfecto, con eso debería quedar resuelta la observación.',
];

function porId(id: string): Conversacion {
  const c = db.conversaciones.find((x) => x.id === id);
  if (!c) throw new ServiceError('Conversación no encontrada', 404);
  return c;
}

function resumir(c: Conversacion): ConversacionResumen {
  const mensajes = db.mensajes.filter((m) => m.conversacionId === c.id);
  return {
    ...c,
    asesorNombre: db.asesores.find((a) => a.id === c.asesorId)?.nombre ?? 'Asesor',
    ultimoMensaje: mensajes.sort((a, b) => b.fecha.localeCompare(a.fecha))[0],
  };
}

function programarRespuesta(conversacionId: string) {
  escribiendo.add(conversacionId);
  emitirCambio('chat');
  setTimeout(() => {
    const conv = db.conversaciones.find((c) => c.id === conversacionId);
    escribiendo.delete(conversacionId);
    if (!conv) return;
    const texto = respuestasSimuladas[Math.floor(Math.random() * respuestasSimuladas.length)]!;
    const fecha = new Date().toISOString();
    db.mensajes.push({ id: nuevoId('msg'), conversacionId, autor: 'asesor', texto, adjuntos: [], fecha });
    conv.actualizada = fecha;
    conv.noLeidos += 1;
    guardarDb();
    emitirCambio('chat');
  }, 2200);
}

export const chatService = {
  async listarConversaciones(usuarioId: string): Promise<ConversacionResumen[]> {
    await delay(150);
    return clonar(
      db.conversaciones
        .filter((c) => c.usuarioId === usuarioId)
        .map(resumir)
        .sort((a, b) => b.actualizada.localeCompare(a.actualizada)),
    );
  },

  async obtener(id: string): Promise<ConversacionResumen> {
    await delay(80);
    return clonar(resumir(porId(id)));
  },

  async listarMensajes(conversacionId: string): Promise<Mensaje[]> {
    await delay(100);
    return clonar(db.mensajes.filter((m) => m.conversacionId === conversacionId).sort((a, b) => a.fecha.localeCompare(b.fecha)));
  },

  estaEscribiendo(conversacionId: string): boolean {
    return escribiendo.has(conversacionId);
  },

  async marcarLeida(conversacionId: string): Promise<void> {
    const c = porId(conversacionId);
    if (c.noLeidos === 0) return;
    c.noLeidos = 0;
    guardarDb();
    emitirCambio('chat');
  },

  async enviarMensaje(conversacionId: string, texto: string, adjuntos: File[] = []): Promise<Mensaje> {
    await delay(200);
    if (!texto.trim() && adjuntos.length === 0) throw new ServiceError('Escribe un mensaje o adjunta un archivo');
    const conv = porId(conversacionId);
    const mensaje: Mensaje = {
      id: nuevoId('msg'),
      conversacionId,
      autor: 'usuario',
      texto: texto.trim(),
      adjuntos: adjuntos.map(archivoDesdeFile),
      fecha: new Date().toISOString(),
    };
    db.mensajes.push(mensaje);
    conv.actualizada = mensaje.fecha;
    guardarDb();
    emitirCambio('chat');
    programarRespuesta(conversacionId);
    return clonar(mensaje);
  },

  /** Devuelve la conversación existente con el asesor (para ese proyecto) o crea una nueva. */
  async iniciar(usuarioId: string, asesorId: string, asunto: string, proyectoId?: string): Promise<Conversacion> {
    await delay(150);
    const existente = db.conversaciones.find((c) => c.usuarioId === usuarioId && c.asesorId === asesorId && c.proyectoId === proyectoId);
    if (existente) return clonar(existente);
    const conv: Conversacion = {
      id: nuevoId('conv'),
      usuarioId,
      asesorId,
      proyectoId,
      asunto,
      noLeidos: 0,
      actualizada: new Date().toISOString(),
    };
    db.conversaciones.push(conv);
    guardarDb();
    emitirCambio('chat');
    return clonar(conv);
  },
};
