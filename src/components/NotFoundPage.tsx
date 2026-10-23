import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Zap } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 rounded-2xl bg-brand-50 p-4">
        <Zap className="h-10 w-10 text-brand-600" />
      </div>
      <p className="text-sm font-semibold text-brand-700">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Página no encontrada</h1>
      <p className="mt-2 max-w-md text-slate-500">
        Parece que este circuito no tiene continuidad. La página que buscas no existe o fue movida.
      </p>
      <div className="mt-8 flex gap-3">
        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <ButtonLink to="/" icon={Home}>
          Ir al inicio
        </ButtonLink>
      </div>
    </div>
  );
}
