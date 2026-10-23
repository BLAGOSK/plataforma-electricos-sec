import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import { ButtonLink } from '@/components/ui';
import { NotFoundPage } from './NotFoundPage';

/** Pantalla de error para fallos no controlados en una ruta. */
export function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;
  const mensaje = error instanceof Error ? error.message : 'Error desconocido';
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <TriangleAlert className="mb-4 h-10 w-10 text-amber-500" />
      <h1 className="text-2xl font-bold text-slate-900">Ocurrió un error inesperado</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">{mensaje}</p>
      <ButtonLink to="/" className="mt-6">
        Volver al inicio
      </ButtonLink>
    </div>
  );
}
