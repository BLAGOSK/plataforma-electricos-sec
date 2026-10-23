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
import { ApoyoTab } from '@/features/proyectos/components/tabs/ApoyoTab';
import { ControlDocumentalTab } from '@/features/proyectos/components/tabs/ControlDocumentalTab';
import { DocumentosTab } from '@/features/proyectos/components/tabs/DocumentosTab';
import { ResumenTab } from '@/features/proyectos/components/tabs/ResumenTab';
import { DocumentoHistorialPage } from '@/features/proyectos/pages/DocumentoHistorialPage';
import { ProyectoDetallePage } from '@/features/proyectos/pages/ProyectoDetallePage';
import { ProyectoNuevoPage } from '@/features/proyectos/pages/ProyectoNuevoPage';
import { ProyectosListPage } from '@/features/proyectos/pages/ProyectosListPage';
import { AsyncCrumb } from '@/layouts/Breadcrumbs';
import { BibliotecaPage } from '@/features/aprendizaje/pages/BibliotecaPage';
import { PliegoDetallePage } from '@/features/aprendizaje/pages/PliegoDetallePage';
import { VideoDetallePage } from '@/features/aprendizaje/pages/VideoDetallePage';
import { VideosPage } from '@/features/aprendizaje/pages/VideosPage';
import { AgendarPage } from '@/features/asesorias/pages/AgendarPage';
import { AsesorPerfilPage } from '@/features/asesorias/pages/AsesorPerfilPage';
import { CalificarAsesoriaPage } from '@/features/asesorias/pages/CalificarAsesoriaPage';
import { ChatPage } from '@/features/asesorias/pages/ChatPage';
import { DirectorioPage } from '@/features/asesorias/pages/DirectorioPage';
import { MisReunionesPage } from '@/features/asesorias/pages/MisReunionesPage';
import { SolicitarAsesoriaPage } from '@/features/asesorias/pages/SolicitarAsesoriaPage';
import { VideollamadaPage } from '@/features/asesorias/pages/VideollamadaPage';
import { aprendizajeService } from '@/services/aprendizajeService';
import { asesoriasService } from '@/services/asesoriasService';
import { documentosService } from '@/services/documentosService';
import { proyectosService } from '@/services/proyectosService';
import { ProtectedRoute, PublicOnlyRoute, SessionRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import type { RouteHandle } from './types';

const h = (crumb: RouteHandle['crumb']): RouteHandle => ({ crumb });
const pendiente = (titulo: string) => <Proximamente titulo={titulo} />;

const rutasProyectos: RouteObject = {
  path: 'proyectos',
  handle: h('Proyectos'),
  children: [
    { index: true, element: <ProyectosListPage /> },
    { path: 'nuevo', handle: h('Nuevo proyecto'), element: <ProyectoNuevoPage /> },
    {
      path: ':id',
      element: <ProyectoDetallePage />,
      handle: h((p) => <AsyncCrumb key={p.id} cargar={() => proyectosService.obtener(p.id!).then((x) => x.nombre)} />),
      children: [
        { index: true, element: <Navigate to="resumen" replace /> },
        { path: 'resumen', handle: h('Resumen'), element: <ResumenTab /> },
        {
          path: 'documentos',
          handle: h('Documentos'),
          children: [
            { index: true, element: <DocumentosTab /> },
            {
              path: ':docId',
              element: <DocumentoHistorialPage />,
              handle: h((p) => <AsyncCrumb key={p.docId} cargar={() => documentosService.obtener(p.docId!).then((d) => d.nombre)} />),
            },
          ],
        },
        { path: 'control-documental', handle: h('Control documental'), element: <ControlDocumentalTab /> },
        { path: 'apoyo', handle: h('Apoyo al eléctrico'), element: <ApoyoTab /> },
      ],
    },
  ],
};

const rutasAprendizaje: RouteObject = {
  path: 'aprendizaje',
  handle: h('Aprendizaje'),
  children: [
    { index: true, element: <BibliotecaPage /> },
    {
      path: 'pliegos/:id',
      element: <PliegoDetallePage />,
      handle: h((p) => <AsyncCrumb key={p.id} cargar={() => aprendizajeService.obtenerDocumento(p.id!).then((d) => d.codigo)} />),
    },
    {
      path: 'videos',
      handle: h('Videos'),
      children: [
        { index: true, element: <VideosPage /> },
        {
          path: ':id',
          element: <VideoDetallePage />,
          handle: h((p) => <AsyncCrumb key={p.id} cargar={() => aprendizajeService.obtenerVideo(p.id!).then((v) => v.titulo)} />),
        },
      ],
    },
  ],
};

const rutasAsesorias: RouteObject = {
  path: 'asesorias',
  handle: h('Asesorías'),
  children: [
    { index: true, element: <DirectorioPage /> },
    { path: 'asesores', element: <Navigate to="/asesorias" replace /> },
    {
      path: 'asesores/:id',
      handle: h((p) => <AsyncCrumb key={p.id} cargar={() => asesoriasService.obtenerAsesor(p.id!).then((a) => a.nombre)} />),
      children: [
        { index: true, element: <AsesorPerfilPage /> },
        { path: 'solicitar', handle: h('Solicitar asesoría'), element: <SolicitarAsesoriaPage /> },
        { path: 'agendar', handle: h('Agendar reunión'), element: <AgendarPage /> },
      ],
    },
    {
      path: 'reuniones',
      handle: h('Mis reuniones'),
      children: [
        { index: true, element: <MisReunionesPage /> },
        { path: ':id', element: <Navigate to="/asesorias/reuniones" replace /> },
        { path: ':id/calificar', handle: h('Calificar asesoría'), element: <CalificarAsesoriaPage /> },
      ],
    },
    {
      path: 'chat',
      handle: h('Mensajes'),
      children: [
        { index: true, element: <ChatPage /> },
        { path: ':conversacionId', element: <ChatPage /> },
      ],
    },
    {
      path: 'videollamada/:reunionId',
      handle: h('Videollamada'),
      element: <VideollamadaPage />,
    },
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
