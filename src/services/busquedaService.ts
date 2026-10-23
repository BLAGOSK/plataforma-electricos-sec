import { db } from '@/mocks/db';
import type { Usuario } from '@/types/usuario';
import { coincide } from '@/utils/texto';
import { delay } from './mockDelay';

export type GrupoBusqueda = 'Proyectos' | 'Páginas' | 'Usuarios';

export interface ResultadoBusqueda {
  id: string;
  grupo: GrupoBusqueda;
  titulo: string;
  subtitulo?: string;
  to: string;
}

const paginas: Array<{ titulo: string; to: string; claves?: string; soloAdmin?: boolean }> = [
  { titulo: 'Inicio', to: '/' },
  { titulo: 'Proyectos', to: '/proyectos', claves: 'declaraciones obras' },
  { titulo: 'Nuevo proyecto', to: '/proyectos/nuevo', claves: 'crear' },
  { titulo: 'Biblioteca normativa', to: '/aprendizaje', claves: 'pliegos ric normas' },
  { titulo: 'Videos y material de apoyo', to: '/aprendizaje/videos' },
  { titulo: 'Asesores', to: '/asesorias', claves: 'profesionales directorio' },
  { titulo: 'Mis reuniones', to: '/asesorias/reuniones', claves: 'agenda calendario' },
  { titulo: 'Mensajes', to: '/asesorias/chat', claves: 'chat' },
  { titulo: 'Extensiones', to: '/extensiones', claves: 'calculos herramientas' },
  { titulo: 'Mi perfil', to: '/configuracion/perfil', claves: 'configuracion cuenta' },
  { titulo: 'Cambiar contraseña', to: '/configuracion/password' },
  { titulo: 'Preferencias de notificaciones', to: '/configuracion/notificaciones' },
  { titulo: 'Panel de administración', to: '/admin', soloAdmin: true },
  { titulo: 'Gestión de usuarios', to: '/admin/usuarios', soloAdmin: true },
  { titulo: 'Catálogo de tipos TE', to: '/admin/tipos-te', soloAdmin: true },
  { titulo: 'Contenidos de aprendizaje', to: '/admin/contenidos', soloAdmin: true },
  { titulo: 'Gestión de asesores', to: '/admin/asesores', soloAdmin: true },
  { titulo: 'Solicitudes de extensiones', to: '/admin/solicitudes-extensiones', soloAdmin: true },
];

const LIMITE_POR_GRUPO = 5;

export const busquedaService = {
  async buscar(consulta: string, usuario: Usuario): Promise<ResultadoBusqueda[]> {
    await delay(120);
    if (consulta.trim().length < 2) return [];
    const esAdmin = usuario.rol === 'admin';

    const resPaginas: ResultadoBusqueda[] = paginas
      .filter((p) => (!p.soloAdmin || esAdmin) && coincide(consulta, p.titulo, p.claves))
      .slice(0, LIMITE_POR_GRUPO)
      .map((p) => ({ id: `pag-${p.to}`, grupo: 'Páginas', titulo: p.titulo, subtitulo: p.to, to: p.to }));

    const resUsuarios: ResultadoBusqueda[] = esAdmin
      ? db.usuarios
          .filter((u) => coincide(consulta, u.nombre, u.rut, u.email))
          .slice(0, LIMITE_POR_GRUPO)
          .map((u) => ({ id: u.id, grupo: 'Usuarios', titulo: u.nombre, subtitulo: `${u.rut} · ${u.email}`, to: `/admin/usuarios/${u.id}` }))
      : [];

    const resProyectos: ResultadoBusqueda[] = db.proyectos
      .filter((p) => esAdmin || p.usuarioId === usuario.id)
      .filter((p) => coincide(consulta, p.nombre, p.codigo, p.cliente.nombre, p.comuna))
      .slice(0, LIMITE_POR_GRUPO)
      .map((p) => ({ id: p.id, grupo: 'Proyectos', titulo: p.nombre, subtitulo: `${p.codigo} · ${p.comuna}`, to: `/proyectos/${p.id}` }));

    return [...resProyectos, ...resPaginas, ...resUsuarios];
  },
};
