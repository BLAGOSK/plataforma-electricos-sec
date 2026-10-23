import { Construction } from 'lucide-react';
import { ButtonLink, Card, EmptyState } from '@/components/ui';

/** Marcador temporal para rutas cuyo módulo aún no se implementa. */
export function Proximamente({ titulo }: { titulo: string }) {
  return (
    <Card>
      <EmptyState
        icon={Construction}
        titulo={titulo}
        descripcion="Esta pantalla se implementa en un módulo posterior de la Fase 1."
        accion={<ButtonLink to="/" variant="outline">Volver al inicio</ButtonLink>}
        className="py-20"
      />
    </Card>
  );
}
