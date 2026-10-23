import { db, guardarDb } from '@/mocks/db';
import type { EstadoProyecto } from '@/types/proyecto';
import type { SolicitudExtension } from '@/types/extension';
import type { EstadoUsuario, Rol, Usuario } from '@/types/usuario';
import { coincide } from '@/utils/texto';
import { emitirCambio } from './eventos';
import { clonar, delay, ServiceError } from './mockDelay';
import { notificacionesService } from './notificacionesService';

export interface FiltrosUsuarios {
  q?: string;
  estado?: EstadoUsuario;
  rol?: Rol;
}

export interface SolicitudExtensionDetalle extends SolicitudExtension {
  usuarioNombre: string;
  usuarioEmail: string;
  extensionNombre: string;
}

export interface ContenidoReciente {
  id: string;
  tipo: 'documento' | 'video';
  titulo: string;
  fecha: string;
  to: string;
}

export interface MetricasAdmin {
  usuariosPorEstado: Record<EstadoUsuario, number>;
  solicitudesPendientes: number;
  totalProyectos: number;
  proyectosPorEstado: Record<EstadoProyecto, number>;
  proyectosPorTipo: Array<{ codigo: string; nombre: string; total: number }>;
  reunionesAgendadas: number;
  totalDocumentos: number;
  /** Registros de usuarios por mes (datos de ejemplo + reales) */
  registrosPorMes: Array<{ mes: string; total: number }>;
  contenidoReciente: ContenidoReciente[];
}

/** Base de ejemplo para el gráfico de registros (meses previos a los datos simulados). */
const registrosBase = [4, 6, 5, 9, 7, 11];

function usuarioPorId(id: string): Usuario {
  const u = db.usuarios.find((x) => x.id === id);
  if (!u) throw new ServiceError('Usuario no encontrado', 404);
  return u;
}

export const adminService = {
  async metricas(): Promise<MetricasAdmin> {
    await delay(250);
    const usuariosPorEstado: Record<EstadoUsuario, number> = { pendiente: 0, aprobado: 0, rechazado: 0, suspendido: 0 };
    db.usuarios.filter((u) => u.rol === 'electrico').forEach((u) => usuariosPorEstado[u.estado]++);

    const proyectosPorEstado: Record<EstadoProyecto, number> = { borrador: 0, en_desarrollo: 0, listo_para_declarar: 0, declarado: 0 };
    db.proyectos.forEach((p) => proyectosPorEstado[p.estado]++);

    const proyectosPorTipo = db.tiposTE
      .map((t) => ({ codigo: t.codigo, nombre: t.nombre, total: db.proyectos.filter((p) => p.tipoTEId === t.id).length }))
      .sort((a, b) => b.total - a.total);

    const hoy = new Date();
    const registrosPorMes = registrosBase.map((base, i) => {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - (registrosBase.length - 1 - i), 1);
      const reales = db.usuarios.filter((u) => {
        const f = new Date(u.fechaRegistro);
        return f.getFullYear() === d.getFullYear() && f.getMonth() === d.getMonth();
      }).length;
      return { mes: d.toLocaleDateString('es-CL', { month: 'short' }), total: base + reales };
    });

    const contenidoReciente: ContenidoReciente[] = [
      ...db.documentosNormativos.map((d) => ({ id: d.id, tipo: 'documento' as const, titulo: `${d.codigo} · ${d.titulo}`, fecha: d.fechaActualizacion, to: `/aprendizaje/pliegos/${d.id}` })),
      ...db.videos.map((v) => ({ id: v.id, tipo: 'video' as const, titulo: v.titulo, fecha: v.fechaPublicacion, to: `/aprendizaje/videos/${v.id}` })),
    ]
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 5);

    return {
      usuariosPorEstado,
      solicitudesPendientes: db.solicitudesExtension.filter((s) => s.estado === 'pendiente').length,
      totalProyectos: db.proyectos.length,
      proyectosPorEstado,
      proyectosPorTipo,
      reunionesAgendadas: db.reuniones.filter((r) => r.estado === 'agendada').length,
      totalDocumentos: db.documentos.length,
      registrosPorMes,
      contenidoReciente,
    };
  },

  // ---- Usuarios ----

  async listarUsuarios(filtros: FiltrosUsuarios = {}): Promise<Usuario[]> {
    await delay(200);
    return clonar(
      db.usuarios
        .filter((u) => !filtros.estado || u.estado === filtros.estado)
        .filter((u) => !filtros.rol || u.rol === filtros.rol)
        .filter((u) => !filtros.q || coincide(filtros.q, u.nombre, u.rut, u.email, u.licencia?.numero))
        .sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro)),
    );
  },

  async contarUsuariosPorEstado(): Promise<Record<EstadoUsuario, number>> {
    await delay(80);
    const r: Record<EstadoUsuario, number> = { pendiente: 0, aprobado: 0, rechazado: 0, suspendido: 0 };
    db.usuarios.forEach((u) => r[u.estado]++);
    return r;
  },

  async obtenerUsuario(id: string): Promise<Usuario> {
    await delay(150);
    return clonar(usuarioPorId(id));
  },

  async cambiarEstadoUsuario(id: string, estado: EstadoUsuario, motivo?: string): Promise<Usuario> {
    await delay(400);
    const u = usuarioPorId(id);
    if (u.rol === 'admin') throw new ServiceError('No se puede cambiar el estado de un administrador');
    if ((estado === 'rechazado' || estado === 'suspendido') && !motivo?.trim()) {
      throw new ServiceError('Debes indicar el motivo');
    }
    u.estado = estado;
    u.motivoEstado = estado === 'aprobado' ? undefined : motivo?.trim();
    u.fechaEstado = new Date().toISOString();
    guardarDb();
    if (estado === 'aprobado') {
      notificacionesService.crear({
        usuarioId: u.id,
        tipo: 'exito',
        titulo: '¡Tu cuenta fue aprobada!',
        mensaje: 'Ya puedes usar todas las funcionalidades de la plataforma.',
        enlace: '/',
      });
    }
    emitirCambio('usuarios');
    return clonar(u);
  },

  // ---- Solicitudes de extensiones ----

  async listarSolicitudesExtension(): Promise<SolicitudExtensionDetalle[]> {
    await delay(200);
    return clonar(
      db.solicitudesExtension
        .map((s) => {
          const u = db.usuarios.find((x) => x.id === s.usuarioId);
          return {
            ...s,
            usuarioNombre: u?.nombre ?? 'Usuario eliminado',
            usuarioEmail: u?.email ?? '',
            extensionNombre: db.extensiones.find((e) => e.id === s.extensionId)?.nombre ?? 'Extensión',
          };
        })
        .sort((a, b) => b.fechaSolicitud.localeCompare(a.fechaSolicitud)),
    );
  },
};
