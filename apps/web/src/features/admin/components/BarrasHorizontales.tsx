/**
 * Gráfico de barras horizontales de una sola serie (magnitud).
 * Un solo tono, valor rotulado al final de cada barra y tooltip nativo por barra.
 */
interface Props {
  datos: Array<{ etiqueta: string; valor: number; detalle?: string }>;
  unidad?: string;
}

export function BarrasHorizontales({ datos, unidad = '' }: Props) {
  const max = Math.max(1, ...datos.map((d) => d.valor));
  return (
    <ul className="space-y-2.5">
      {datos.map((d) => (
        <li key={d.etiqueta} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 text-sm" title={`${d.detalle ?? d.etiqueta}: ${d.valor}${unidad}`}>
          <span className="truncate text-slate-600">{d.etiqueta}</span>
          <span className="h-3 rounded-r bg-slate-100">
            <span className="block h-full rounded-r bg-brand-600 transition-all" style={{ width: `${(d.valor / max) * 100}%`, minWidth: d.valor ? 4 : 0 }} />
          </span>
          <span className="text-right font-medium tabular-nums text-slate-800">{d.valor}</span>
        </li>
      ))}
    </ul>
  );
}

/** Columnas verticales de una sola serie (ej. registros por mes). */
export function Columnas({ datos }: { datos: Array<{ etiqueta: string; valor: number }> }) {
  const max = Math.max(1, ...datos.map((d) => d.valor));
  return (
    <div>
      <div className="flex h-40 items-end gap-2 border-b border-slate-200">
        {datos.map((d) => (
          <div key={d.etiqueta} className="group relative flex h-full flex-1 flex-col justify-end" title={`${d.etiqueta}: ${d.valor}`}>
            <span className="mb-1 text-center text-xs font-medium tabular-nums text-slate-700">{d.valor}</span>
            <span className="block rounded-t bg-brand-600 transition-colors group-hover:bg-brand-700" style={{ height: `${(d.valor / max) * 75}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2">
        {datos.map((d) => (
          <span key={d.etiqueta} className="flex-1 text-center text-xs capitalize text-slate-500">
            {d.etiqueta}
          </span>
        ))}
      </div>
    </div>
  );
}
