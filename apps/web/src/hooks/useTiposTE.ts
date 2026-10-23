import { useMemo } from 'react';
import { tiposTEService } from '@/services/tiposTEService';
import { useVersion } from '@/services/eventos';
import type { TipoTE } from '@/types/tipoTE';
import { useAsync } from './useAsync';

/** Catálogo de tipos TE con un índice por id (para mostrar etiquetas). */
export function useTiposTE() {
  const version = useVersion('proyectos');
  const { data: tipos = [], loading } = useAsync(() => tiposTEService.listar(), [version]);
  const porId = useMemo(() => Object.fromEntries(tipos.map((t) => [t.id, t])) as Record<string, TipoTE>, [tipos]);
  return { tipos, porId, loading };
}
