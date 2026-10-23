import type { ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import type { TipoTE } from '@/types/tipoTE';
import { formatNumero } from '@/utils/format';
import { Alert } from '@/components/ui';
import type { FormProyecto } from './tipos';

function Seccion({ titulo, onEditar, children }: { titulo: string; onEditar: () => void; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <p className="text-sm font-semibold text-slate-900">{titulo}</p>
        <button type="button" onClick={onEditar} className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800">
          <Pencil className="h-3.5 w-3.5" /> Editar
        </button>
      </div>
      <dl className="grid gap-x-4 gap-y-2 p-4 text-sm sm:grid-cols-[10rem_1fr]">{children}</dl>
    </div>
  );
}

function Dato({ label, valor }: { label: string; valor?: ReactNode }) {
  return (
    <>
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-900">{valor || <span className="text-slate-400">—</span>}</dd>
    </>
  );
}

interface Props {
  form: FormProyecto;
  tipo?: TipoTE;
  irAPaso: (paso: number) => void;
}

export function PasoResumen({ form, tipo, irAPaso }: Props) {
  return (
    <div className="space-y-4">
      <Seccion titulo="Datos generales" onEditar={() => irAPaso(0)}>
        <Dato label="Nombre" valor={form.nombre} />
        <Dato label="Descripción" valor={form.descripcion} />
        <Dato label="Cliente" valor={form.clienteNombre} />
        <Dato label="RUT cliente" valor={form.clienteRut} />
        <Dato label="Contacto" valor={[form.clienteEmail, form.clienteTelefono].filter(Boolean).join(' · ')} />
        <Dato label="Dirección" valor={`${form.direccion}, ${form.comuna}`} />
        <Dato label="Región" valor={form.region} />
        <Dato label="Potencia" valor={`${formatNumero(Number(form.potenciaKw.replace(',', '.')), 1)} kW`} />
      </Seccion>
      <Seccion titulo="Tipo de declaración" onEditar={() => irAPaso(1)}>
        <Dato label="Tipo TE" valor={tipo && `${tipo.codigo} — ${tipo.nombre}`} />
        <Dato label="Documentos" valor={tipo && `${tipo.documentosRequeridos.length} definidos (${tipo.documentosRequeridos.filter((d) => d.obligatorio).length} obligatorios)`} />
      </Seccion>
      <Alert tipo="info">
        El proyecto se creará en estado <strong>Borrador</strong>. Pasará a <strong>En desarrollo</strong> al cargar el primer documento.
      </Alert>
    </div>
  );
}
