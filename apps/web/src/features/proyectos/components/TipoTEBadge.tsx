import { Badge } from '@/components/ui';

export function TipoTEBadge({ codigo, nombre }: { codigo: string; nombre?: string }) {
  return (
    <span title={nombre}>
      <Badge color="brand" className="font-semibold">
        {codigo}
      </Badge>
    </span>
  );
}
