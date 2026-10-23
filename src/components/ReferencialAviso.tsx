import type { ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Badge } from './ui/Badge';

/** Marca contenido técnico/normativo de ejemplo que debe ser validado por un profesional. */
export function ReferencialBadge() {
  return (
    <Badge color="orange" icon={TriangleAlert}>
      Contenido referencial a validar
    </Badge>
  );
}

export function ReferencialAviso({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <span className="font-semibold">Contenido referencial a validar.</span>{' '}
        {children ??
          'La información normativa mostrada es de ejemplo y debe ser revisada contra la normativa SEC vigente antes de su uso.'}
      </p>
    </div>
  );
}
