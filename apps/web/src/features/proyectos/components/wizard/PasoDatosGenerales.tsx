import { Building2, IdCard, Mail, MapPin, Phone, Zap } from 'lucide-react';
import { Input, Select, Textarea } from '@/components/ui';
import { formatearRut, errorRut } from '@/features/auth/utils/rut';
import { regiones } from '@/mocks/geografia';
import type { ErroresProyecto, FormProyecto } from './tipos';

interface Props {
  form: FormProyecto;
  errores: ErroresProyecto;
  onChange: <K extends keyof FormProyecto>(campo: K, valor: FormProyecto[K]) => void;
}

export function PasoDatosGenerales({ form, errores, onChange }: Props) {
  const comunas = regiones.find((r) => r.nombre === form.region)?.comunas ?? [];

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">Identificación del proyecto</h3>
        <Input
          label="Nombre del proyecto"
          required
          value={form.nombre}
          onChange={(e) => onChange('nombre', e.target.value)}
          error={errores.nombre}
          placeholder="Ej: Ampliación vivienda Familia Rojas"
          autoFocus
        />
        <Textarea
          label="Descripción"
          value={form.descripcion}
          onChange={(e) => onChange('descripcion', e.target.value)}
          placeholder="Alcance de los trabajos, recintos involucrados, observaciones…"
          hint="Opcional"
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">Cliente o mandante</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nombre o razón social"
            icon={Building2}
            required
            value={form.clienteNombre}
            onChange={(e) => onChange('clienteNombre', e.target.value)}
            error={errores.clienteNombre}
          />
          <Input
            label="RUT"
            icon={IdCard}
            value={form.clienteRut}
            onChange={(e) => onChange('clienteRut', e.target.value)}
            onBlur={() => form.clienteRut && !errorRut(form.clienteRut) && onChange('clienteRut', formatearRut(form.clienteRut))}
            error={errores.clienteRut}
            placeholder="Opcional"
          />
          <Input
            label="Correo"
            icon={Mail}
            type="email"
            value={form.clienteEmail}
            onChange={(e) => onChange('clienteEmail', e.target.value)}
            error={errores.clienteEmail}
            placeholder="Opcional"
          />
          <Input
            label="Teléfono"
            icon={Phone}
            value={form.clienteTelefono}
            onChange={(e) => onChange('clienteTelefono', e.target.value)}
            placeholder="Opcional"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">Ubicación y potencia</h3>
        <Input
          label="Dirección de la instalación"
          icon={MapPin}
          required
          value={form.direccion}
          onChange={(e) => onChange('direccion', e.target.value)}
          error={errores.direccion}
          placeholder="Calle, número, depto/casa"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Región"
            required
            value={form.region}
            onChange={(e) => {
              onChange('region', e.target.value);
              onChange('comuna', '');
            }}
            error={errores.region}
            placeholder="Selecciona…"
            opciones={regiones.map((r) => ({ value: r.nombre, label: r.nombre }))}
          />
          <Select
            label="Comuna"
            required
            value={form.comuna}
            onChange={(e) => onChange('comuna', e.target.value)}
            error={errores.comuna}
            placeholder="Selecciona…"
            opciones={comunas.map((c) => ({ value: c, label: c }))}
            disabled={!form.region}
          />
          <Input
            label="Potencia declarada"
            icon={Zap}
            required
            inputMode="decimal"
            sufijo="kW"
            value={form.potenciaKw}
            onChange={(e) => onChange('potenciaKw', e.target.value.replace(/[^\d.,]/g, ''))}
            error={errores.potenciaKw}
            placeholder="0,0"
          />
        </div>
      </section>
    </div>
  );
}
