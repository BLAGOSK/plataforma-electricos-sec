import { db, guardarDb, nuevoId } from '@/mocks/db';
import type { TipoTE, TipoTEPayload } from '@/types/tipoTE';
import { emitirCambio } from './eventos';
import { clonar, delay, ServiceError } from './mockDelay';

function porId(id: string): TipoTE {
  const t = db.tiposTE.find((x) => x.id === id);
  if (!t) throw new ServiceError('Tipo TE no encontrado', 404);
  return t;
}

function validarCodigoUnico(codigo: string, exceptoId?: string) {
  if (db.tiposTE.some((t) => t.id !== exceptoId && t.codigo.toUpperCase() === codigo.trim().toUpperCase())) {
    throw new ServiceError(`Ya existe un tipo con el código ${codigo}`, 409);
  }
}

export const tiposTEService = {
  async listar(opciones: { soloActivos?: boolean } = {}): Promise<TipoTE[]> {
    await delay(150);
    const lista = opciones.soloActivos ? db.tiposTE.filter((t) => t.activo) : db.tiposTE;
    return clonar([...lista].sort((a, b) => a.codigo.localeCompare(b.codigo, 'es', { numeric: true })));
  },

  async obtener(id: string): Promise<TipoTE> {
    await delay(100);
    return clonar(porId(id));
  },

  // ---- Administración ----

  async crear(payload: TipoTEPayload): Promise<TipoTE> {
    await delay(400);
    validarCodigoUnico(payload.codigo);
    const tipo: TipoTE = { ...clonar(payload), codigo: payload.codigo.trim().toUpperCase(), id: nuevoId('te') };
    db.tiposTE.push(tipo);
    guardarDb();
    emitirCambio('proyectos');
    return clonar(tipo);
  },

  async actualizar(id: string, payload: TipoTEPayload): Promise<TipoTE> {
    await delay(400);
    validarCodigoUnico(payload.codigo, id);
    const tipo = porId(id);
    Object.assign(tipo, clonar(payload), { codigo: payload.codigo.trim().toUpperCase() });
    guardarDb();
    emitirCambio('proyectos');
    return clonar(tipo);
  },

  async eliminar(id: string): Promise<void> {
    await delay(300);
    const enUso = db.proyectos.filter((p) => p.tipoTEId === id).length;
    if (enUso > 0) {
      throw new ServiceError(`No se puede eliminar: ${enUso} proyecto(s) usan este tipo. Desactívalo en su lugar.`, 409);
    }
    db.tiposTE = db.tiposTE.filter((t) => t.id !== id);
    guardarDb();
    emitirCambio('proyectos');
  },

  async proyectosPorTipo(): Promise<Record<string, number>> {
    await delay(100);
    return db.proyectos.reduce<Record<string, number>>((acc, p) => {
      acc[p.tipoTEId] = (acc[p.tipoTEId] ?? 0) + 1;
      return acc;
    }, {});
  },
};
