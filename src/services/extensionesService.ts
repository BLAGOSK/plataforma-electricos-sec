import { db, guardarDb, nuevoId } from '@/mocks/db';
import type { ExtensionConEstado, ExtensionSlug, SolicitudExtension } from '@/types/extension';
import { emitirCambio } from './eventos';
import { clonar, delay, ServiceError } from './mockDelay';
import { notificacionesService } from './notificacionesService';

/** Última solicitud del usuario para cada extensión. */
function ultimaSolicitud(usuarioId: string, extensionId: string): SolicitudExtension | undefined {
  return db.solicitudesExtension
    .filter((s) => s.usuarioId === usuarioId && s.extensionId === extensionId)
    .sort((a, b) => b.fechaSolicitud.localeCompare(a.fechaSolicitud))[0];
}

function conEstado(usuarioId: string): ExtensionConEstado[] {
  return db.extensiones.map((e) => {
    const solicitud = ultimaSolicitud(usuarioId, e.id);
    return { ...e, estado: solicitud?.estado ?? 'no_solicitada', solicitud };
  });
}

export const extensionesService = {
  async listarParaUsuario(usuarioId: string): Promise<ExtensionConEstado[]> {
    await delay(150);
    return clonar(conEstado(usuarioId));
  },

  async activas(usuarioId: string): Promise<ExtensionConEstado[]> {
    await delay(100);
    return clonar(conEstado(usuarioId).filter((e) => e.estado === 'activa'));
  },

  async obtenerParaUsuario(usuarioId: string, slug: ExtensionSlug): Promise<ExtensionConEstado> {
    await delay(150);
    const ext = conEstado(usuarioId).find((e) => e.slug === slug);
    if (!ext) throw new ServiceError('Extensión no encontrada', 404);
    return clonar(ext);
  },

  async solicitar(usuarioId: string, extensionId: string, comentario?: string): Promise<SolicitudExtension> {
    await delay(400);
    const previa = ultimaSolicitud(usuarioId, extensionId);
    if (previa && (previa.estado === 'pendiente' || previa.estado === 'activa')) {
      throw new ServiceError('Ya existe una solicitud vigente para esta extensión', 409);
    }
    const solicitud: SolicitudExtension = {
      id: nuevoId('sol'),
      usuarioId,
      extensionId,
      estado: 'pendiente',
      comentario: comentario?.trim() || undefined,
      fechaSolicitud: new Date().toISOString(),
    };
    db.solicitudesExtension.push(solicitud);
    guardarDb();
    emitirCambio('extensiones');
    return clonar(solicitud);
  },

  // ---- Administración ----

  async listarSolicitudes(): Promise<SolicitudExtension[]> {
    await delay(200);
    return clonar([...db.solicitudesExtension].sort((a, b) => b.fechaSolicitud.localeCompare(a.fechaSolicitud)));
  },

  async resolverSolicitud(
    solicitudId: string,
    decision: 'activa' | 'rechazada',
    motivoRechazo?: string,
  ): Promise<SolicitudExtension> {
    await delay(400);
    const s = db.solicitudesExtension.find((x) => x.id === solicitudId);
    if (!s) throw new ServiceError('Solicitud no encontrada', 404);
    if (decision === 'rechazada' && !motivoRechazo?.trim()) {
      throw new ServiceError('Debes indicar el motivo del rechazo');
    }
    s.estado = decision;
    s.fechaResolucion = new Date().toISOString();
    s.motivoRechazo = decision === 'rechazada' ? motivoRechazo!.trim() : undefined;
    const ext = db.extensiones.find((e) => e.id === s.extensionId);
    notificacionesService.crear({
      usuarioId: s.usuarioId,
      tipo: decision === 'activa' ? 'exito' : 'alerta',
      titulo: decision === 'activa' ? 'Extensión activada' : 'Solicitud de extensión rechazada',
      mensaje:
        decision === 'activa'
          ? `La extensión "${ext?.nombre}" ya está disponible en tu menú.`
          : `Tu solicitud de "${ext?.nombre}" fue rechazada: ${s.motivoRechazo}`,
      enlace: '/extensiones',
    });
    guardarDb();
    emitirCambio('extensiones');
    return clonar(s);
  },
};
