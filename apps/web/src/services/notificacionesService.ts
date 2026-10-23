import { db, guardarDb, nuevoId } from '@/mocks/db';
import type { Notificacion } from '@/types/notificacion';
import { emitirCambio } from './eventos';
import { clonar, delay } from './mockDelay';

export const notificacionesService = {
  async listar(usuarioId: string): Promise<Notificacion[]> {
    await delay(150);
    return clonar(
      db.notificaciones
        .filter((n) => n.usuarioId === usuarioId)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    );
  },

  async marcarLeida(id: string): Promise<void> {
    const n = db.notificaciones.find((x) => x.id === id);
    if (n) n.leida = true;
    guardarDb();
    emitirCambio('notificaciones');
  },

  async marcarTodasLeidas(usuarioId: string): Promise<void> {
    db.notificaciones.filter((n) => n.usuarioId === usuarioId).forEach((n) => (n.leida = true));
    guardarDb();
    emitirCambio('notificaciones');
  },

  /** Uso interno de otros servicios simulados (en la API real lo hará el backend). */
  crear(n: Omit<Notificacion, 'id' | 'fecha' | 'leida'>): void {
    db.notificaciones.unshift({ ...n, id: nuevoId('not'), fecha: new Date().toISOString(), leida: false });
    guardarDb();
    emitirCambio('notificaciones');
  },
};
