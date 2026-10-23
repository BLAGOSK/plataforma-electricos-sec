import { useEffect, useState } from 'react';
import { Link, useMatches } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import type { RouteHandle } from '@/router/types';

export function Breadcrumbs() {
  const matches = useMatches();
  const migas = matches.filter((m) => (m.handle as RouteHandle | undefined)?.crumb);

  if (migas.length === 0) return null;

  return (
    <nav aria-label="Ruta de navegación" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
        <li>
          <Link to="/" className="flex items-center rounded p-0.5 hover:text-brand-700" aria-label="Inicio">
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {migas.map((m, i) => {
          const { crumb } = m.handle as RouteHandle;
          const contenido = typeof crumb === 'function' ? crumb(m.params) : crumb;
          const ultimo = i === migas.length - 1;
          return (
            <li key={m.id} className="flex min-w-0 items-center gap-1">
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              {ultimo ? (
                <span className="max-w-[16rem] truncate font-medium text-slate-800" aria-current="page">
                  {contenido}
                </span>
              ) : (
                <Link to={m.pathname} className="max-w-[12rem] truncate hover:text-brand-700">
                  {contenido}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Miga de pan cuyo texto se obtiene de un servicio (ej. nombre del proyecto). */
export function AsyncCrumb({ cargar, respaldo = '…' }: { cargar: () => Promise<string>; respaldo?: string }) {
  const [texto, setTexto] = useState(respaldo);
  useEffect(() => {
    let vivo = true;
    cargar()
      .then((t) => vivo && setTexto(t))
      .catch(() => vivo && setTexto('No encontrado'));
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{texto}</>;
}
