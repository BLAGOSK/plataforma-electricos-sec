import {
  CalendarDays,
  ClipboardCheck,
  FolderKanban,
  GraduationCap,
  Home,
  LayoutDashboard,
  ListChecks,
  MessagesSquare,
  Puzzle,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Library,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react';

export interface ItemNav {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Coincidencia exacta de ruta para marcarlo activo */
  end?: boolean;
  hijos?: ItemNav[];
}

export const navPrincipal: ItemNav[] = [
  { label: 'Inicio', to: '/', icon: Home, end: true },
  { label: 'Proyectos', to: '/proyectos', icon: FolderKanban },
  {
    label: 'Aprendizaje',
    to: '/aprendizaje',
    icon: GraduationCap,
    hijos: [
      { label: 'Biblioteca normativa', to: '/aprendizaje', icon: Library, end: true },
      { label: 'Videos y material', to: '/aprendizaje/videos', icon: PlayCircle },
    ],
  },
  {
    label: 'Asesorías',
    to: '/asesorias',
    icon: Users,
    hijos: [
      { label: 'Asesores', to: '/asesorias', icon: Users, end: true },
      { label: 'Mis reuniones', to: '/asesorias/reuniones', icon: CalendarDays },
      { label: 'Mensajes', to: '/asesorias/chat', icon: MessagesSquare },
    ],
  },
];

export const navExtensiones: ItemNav = { label: 'Extensiones', to: '/extensiones', icon: Puzzle, end: true };

export const navConfiguracion: ItemNav = { label: 'Configuración', to: '/configuracion', icon: Settings };

export const navAdmin: ItemNav = {
  label: 'Administración',
  to: '/admin',
  icon: ShieldCheck,
  hijos: [
    { label: 'Panel', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Usuarios', to: '/admin/usuarios', icon: UserCog },
    { label: 'Tipos TE', to: '/admin/tipos-te', icon: ListChecks },
    { label: 'Contenidos', to: '/admin/contenidos', icon: Library },
    { label: 'Asesores', to: '/admin/asesores', icon: Users },
    { label: 'Solicitudes de extensiones', to: '/admin/solicitudes-extensiones', icon: ClipboardCheck },
  ],
};
