import { Link } from 'react-router-dom';
import { ArrowRight, FolderKanban, GraduationCap, Plus, Puzzle, ShieldCheck, Users, type LucideIcon } from 'lucide-react';
import { useAuth, useUsuario } from '@/features/auth/context/AuthContext';
import { ButtonLink, Card } from '@/components/ui';
import { ResumenActividad } from '../components/ResumenActividad';

interface Acceso {
  titulo: string;
  descripcion: string;
  to: string;
  icon: LucideIcon;
  color: string;
}

const accesos: Acceso[] = [
  {
    titulo: 'Proyectos',
    descripcion: 'Crea y gestiona tus proyectos, documentos y revisiones por tipo TE.',
    to: '/proyectos',
    icon: FolderKanban,
    color: 'bg-brand-50 text-brand-700',
  },
  {
    titulo: 'Aprendizaje',
    descripcion: 'Pliegos técnicos RIC, normativa asociada y videos de apoyo.',
    to: '/aprendizaje',
    icon: GraduationCap,
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    titulo: 'Asesorías',
    descripcion: 'Encuentra asesores, conversa con ellos y agenda reuniones.',
    to: '/asesorias',
    icon: Users,
    color: 'bg-violet-50 text-violet-700',
  },
  {
    titulo: 'Extensiones',
    descripcion: 'Herramientas de cálculo: conductores, caída de tensión, cortocircuito y alumbrado.',
    to: '/extensiones',
    icon: Puzzle,
    color: 'bg-amber-50 text-amber-700',
  },
];

function saludo(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export function InicioPage() {
  const usuario = useUsuario();
  const { esAdmin } = useAuth();
  const nombre = usuario.nombre.split(' ')[0];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-brand-900 px-6 py-8 text-white sm:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 85% 20%, #fbbf24 0, transparent 35%)',
          }}
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-brand-200">{saludo()},</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{nombre}</h1>
            <p className="mt-2 max-w-xl text-sm text-brand-100">
              {esAdmin
                ? 'Revisa las solicitudes pendientes y mantén actualizados los contenidos de la plataforma.'
                : 'Continúa con tus proyectos o explora el material de apoyo para tu próxima declaración.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {esAdmin && (
              <ButtonLink to="/admin" variant="secondary" icon={ShieldCheck}>
                Panel de administración
              </ButtonLink>
            )}
            <ButtonLink to="/proyectos/nuevo" icon={Plus} className="bg-accent-500 text-brand-950 hover:bg-accent-400">
              Nuevo proyecto
            </ButtonLink>
          </div>
        </div>
      </div>

      <ResumenActividad />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {accesos.map(({ titulo, descripcion, to, icon: Icon, color }) => (
          <Link key={to} to={to} className="group">
            <Card className="h-full p-5 transition-shadow group-hover:shadow-md">
              <div className={`inline-flex rounded-lg p-2.5 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-semibold text-slate-900">{titulo}</h2>
              <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
                Ir a {titulo.toLowerCase()} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
