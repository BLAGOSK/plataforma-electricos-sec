import { useTiposTE } from '@/hooks/useTiposTE';
import { cn } from '@/utils/cn';
import { Field } from '@/components/ui';

/** Selección múltiple de tipos TE como "chips" alternables. */
export function SelectorTiposTE({ value, onChange, label = 'Tipos TE relacionados' }: { value: string[]; onChange: (ids: string[]) => void; label?: string }) {
  const { tipos } = useTiposTE();
  return (
    <Field id="tipos-te" label={label}>
      <div className="flex flex-wrap gap-2">
        {tipos.map((t) => {
          const activo = value.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              title={t.nombre}
              aria-pressed={activo}
              onClick={() => onChange(activo ? value.filter((v) => v !== t.id) : [...value, t.id])}
              className={cn(
                'rounded-md border px-2.5 py-1 text-sm font-semibold transition-colors',
                activo ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-200 text-slate-600 hover:border-brand-300',
              )}
            >
              {t.codigo}
            </button>
          );
        })}
      </div>
    </Field>
  );
}
