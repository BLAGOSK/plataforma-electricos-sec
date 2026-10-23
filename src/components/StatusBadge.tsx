import { Badge } from './ui/Badge';
import { dominiosEstado, type DominioEstado, type InfoEstado } from '@/utils/estados';

interface StatusBadgeProps {
  dominio: DominioEstado;
  estado: string;
  className?: string;
}

/** Insignia de estado con etiqueta y color definidos en utils/estados.ts. */
export function StatusBadge({ dominio, estado, className }: StatusBadgeProps) {
  const mapa = dominiosEstado[dominio] as Record<string, InfoEstado>;
  const info = mapa[estado] ?? { label: estado, color: 'gray' as const };
  return (
    <Badge color={info.color} dot className={className}>
      {info.label}
    </Badge>
  );
}
