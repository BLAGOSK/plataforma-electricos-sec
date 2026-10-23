import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { NotFoundPage } from '@/components/NotFoundPage';
import { Proximamente } from '@/components/Proximamente';
import { RouteError } from '@/components/RouteError';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { PendienteValidacionPage } from '@/features/auth/pages/PendienteValidacionPage';
import { RegistroPage } from '@/features/auth/pages/RegistroPage';
import { InicioPage } from '@/features/dashboard/pages/InicioPage';
import { ProtectedRoute, PublicOnlyRoute, SessionRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import type { RouteHandle } from './types';

const h = (crumb: RouteHandle['crumb']): RouteHandle => ({ crumb });
const pendiente = (titulo: string) => <Proximamente titulo={titulo} />;

const rutasProyectos: RouteObject = {
  path: 'proyectos',
  handle: h('Proyectos'),
  children: [
    { index: true, element: pendiente('Proyectos') },
    { path: 'nuevo', handle: h('Nuevo proyecto'), element: pendiente('Nuevo proyecto') },
    { path: ':id/*', handle: h('Proyecto'), element: pendiente('Detalle del proyecto') },
  ],
};

const rutasAprendizaje: RouteObject = {
  path: 'aprendizaje',
  handle: h('Aprendizaje'),
  children: [
    { index: true, element: pendiente('Biblioteca normativa') },
    { path: 'pliegos/:id', handle: h('Pliego'), element: pendiente('Pliego técnico') },
    { path: 'videos', handle: h('Videos'), element: pendiente('Videos y material de apoyo') },
    { path: 'videos/:id', handle: h('Video'), element: pendiente('Video') },
  ],
};

const rutasAsesorias: RouteObject = {
  path: 'asesorias',
  handle: h('Asesorías'),
  children: [
    { index: true, element: pendiente('Directorio de asesores') },
    { path: 'asesores/:id/*', handle: h('Asesor'), element: pendiente('Perfil del asesor') },
    { path: 'reuniones/*', handle: h('Mis reuniones'), element: pendiente('Mis reuniones') },
    { path: 'chat/*', handle: h('Mensajes'), element: pendiente('Mensajes') },
    { path: 'videollamada/:reunionId', handle: h('Videollamada'), element: pendiente('Videollamada') },
  ],
};

const rutasExtensiones: RouteObject = {
  path: 'extensiones',
  handle: h('Extensiones'),
  children: [
    { index: true, element: pendiente('Catálogo de extensiones') },
    { path: ':slug', handle: h('Herramienta'), element: pendiente('Extensión') },
  ],
};

const rutasConfiguracion: RouteObject = {
  path: 'configuracion',
  handle: h('Configuración'),
  children: [
    { index: true, element: <Navigate to="perfil" replace /> },
    { path: '*', element: pendiente('Configuración') },
  ],
};

const rutasAdmin: RouteObject = {
  path: 'admin',
  element: <RoleRoute roles={['admin']} />,
  handle: h('Administración'),
  children: [
    { index: true, element: pendiente('Panel de administración') },
    { path: 'usuarios/*', handle: h('Usuarios'), element: pendiente('Gestión de usuarios') },
    { path: 'tipos-te', handle: h('Tipos TE'), element: pendiente('Catálogo de tipos TE') },
    { path: 'contenidos', handle: h('Contenidos'), element: pendiente('Contenidos de aprendizaje') },
    { path: 'asesores', handle: h('Asesores'), element: pendiente('Gestión de asesores') },
    {
      path: 'solicitudes-extensiones',
      handle: h('Solicitudes de extensiones'),
      element: pendiente('Solicitudes de extensiones'),
    },
  ],
};

export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: '/login', element: <LoginPage /> },
              { path: '/registro', element: <RegistroPage /> },
            ],
          },
        ],
      },
      {
        element: <SessionRoute />,
        children: [{ element: <AuthLayout />, children: [{ path: '/pendiente-validacion', element: <PendienteValidacionPage /> }] }],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/',
            element: <AppLayout />,
            children: [
              { index: true, element: <InicioPage /> },
              rutasProyectos,
              rutasAprendizaje,
              rutasAsesorias,
              rutasExtensiones,
              rutasConfiguracion,
              rutasAdmin,
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
