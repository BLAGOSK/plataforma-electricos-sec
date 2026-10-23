import { Outlet } from 'react-router-dom';
import { BookOpen, FolderKanban, ShieldCheck, Users } from 'lucide-react';
import { Logo } from './Logo';

const beneficios = [
  { icon: FolderKanban, texto: 'Gestiona tus proyectos y el control documental de cada declaración TE.' },
  { icon: BookOpen, texto: 'Consulta los pliegos técnicos RIC y material de apoyo actualizado.' },
  { icon: Users, texto: 'Conecta con asesores expertos por chat, videollamada o en terreno.' },
  { icon: ShieldCheck, texto: 'Acceso exclusivo para instaladores con licencia SEC validada.' },
];

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[44%] max-w-xl flex-col justify-between overflow-hidden bg-brand-950 p-10 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <Logo claro className="relative" />
        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight text-white">
            Todo lo que un instalador eléctrico necesita, <span className="text-accent-400">en un solo lugar.</span>
          </h2>
          <ul className="mt-8 space-y-4">
            {beneficios.map(({ icon: Icon, texto }) => (
              <li key={texto} className="flex items-start gap-3 text-brand-100">
                <span className="rounded-lg bg-white/10 p-2">
                  <Icon className="h-4 w-4 text-accent-400" />
                </span>
                <span className="pt-1 text-sm">{texto}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-brand-300/70">
          Maqueta navegable · Fase 1 · Los datos mostrados son simulados.
        </p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-10 sm:px-8">
        <Logo className="mb-8 lg:hidden" />
        <div className="w-full max-w-lg">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
