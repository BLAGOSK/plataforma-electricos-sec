import { Link } from 'react-router-dom';
import type { TipoTE } from '@/types/tipoTE';

interface Props {
  ids: string[];
  porId: Record<string, TipoTE>;
  /** Si se indica, cada etiqueta enlaza a esta ruta con ?te=<id> */
  enlazarA?: string;
}

export function TETags({ ids, porId, enlazarA }: Props) {
  if (ids.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {ids.map((id) => {
        const t = porId[id];
        if (!t) return null;
        const clase = 'rounded bg-brand-50 px-1.5 py-0.5 text-[11px] font-semibold text-brand-800 ring-1 ring-inset ring-brand-200';
        return enlazarA ? (
          <Link key={id} to={`${enlazarA}?te=${id}`} title={t.nombre} className={`${clase} hover:bg-brand-100`} onClick={(e) => e.stopPropagation()}>
            {t.codigo}
          </Link>
        ) : (
          <span key={id} title={t.nombre} className={clase}>
            {t.codigo}
          </span>
        );
      })}
    </div>
  );
}
