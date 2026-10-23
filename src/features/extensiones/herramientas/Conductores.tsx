import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Input, Select, Table, TBody, Td, Th, THead, Tr } from '@/components/ui';
import { cn } from '@/utils/cn';
import { HerramientaLayout, Indicador } from '../components/HerramientaLayout';

const candidatas = [
  { seccion: '2,5', admisible: 24, cumple: false },
  { seccion: '4', admisible: 32, cumple: false },
  { seccion: '6', admisible: 41, cumple: true, sugerida: true },
  { seccion: '10', admisible: 57, cumple: true },
  { seccion: '16', admisible: 76, cumple: true },
];

export function Conductores({ proyectoNombre }: { proyectoNombre?: string }) {
  const [f, setF] = useState({
    sistema: 'trifasico',
    tension: '380',
    potencia: '15',
    fp: '0,93',
    longitud: '35',
    material: 'cu',
    aislacion: 'thhn',
    metodo: 'ducto_embutido',
    temperatura: '30',
    agrupados: '3',
  });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  return (
    <HerramientaLayout
      proyectoNombre={proyectoNombre}
      entradas={
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Sistema" value={f.sistema} onChange={set('sistema')} opciones={[{ value: 'monofasico', label: 'Monofásico' }, { value: 'trifasico', label: 'Trifásico' }]} />
            <Select label="Tensión" value={f.tension} onChange={set('tension')} opciones={[{ value: '220', label: '220 V' }, { value: '380', label: '380 V' }]} />
            <Input label="Potencia" sufijo="kW" value={f.potencia} onChange={set('potencia')} inputMode="decimal" />
            <Input label="Factor de potencia" value={f.fp} onChange={set('fp')} inputMode="decimal" />
            <Input label="Longitud del circuito" sufijo="m" value={f.longitud} onChange={set('longitud')} inputMode="decimal" />
            <Select label="Material" value={f.material} onChange={set('material')} opciones={[{ value: 'cu', label: 'Cobre' }, { value: 'al', label: 'Aluminio' }]} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Aislación"
              value={f.aislacion}
              onChange={set('aislacion')}
              opciones={[
                { value: 'thhn', label: 'THHN / THWN-2 (90 °C)' },
                { value: 'xtu', label: 'XTU (90 °C)' },
                { value: 'lh', label: 'Libre de halógenos' },
              ]}
            />
            <Select
              label="Método de instalación"
              value={f.metodo}
              onChange={set('metodo')}
              opciones={[
                { value: 'ducto_embutido', label: 'Ducto embutido' },
                { value: 'ducto_sobrepuesto', label: 'Ducto sobrepuesto' },
                { value: 'bandeja', label: 'Bandeja perforada' },
                { value: 'enterrado', label: 'Enterrado' },
              ]}
            />
            <Input label="Temperatura ambiente" sufijo="°C" value={f.temperatura} onChange={set('temperatura')} inputMode="numeric" />
            <Input label="Circuitos agrupados" value={f.agrupados} onChange={set('agrupados')} inputMode="numeric" />
          </div>
        </>
      }
      resultados={
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Indicador label="Corriente de diseño" valor="24,5" unidad="A" />
            <Indicador label="Factor temperatura" valor="1,00" />
            <Indicador label="Factor agrupamiento" valor="0,70" />
            <Indicador label="Corriente requerida" valor="35,0" unidad="A" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Indicador label="Sección sugerida" valor="6" unidad="mm²" destacado />
            <Indicador label="Protección sugerida" valor="32" unidad="A · curva C" destacado />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">Secciones evaluadas</p>
            <Table>
              <THead>
                <tr>
                  <Th>Sección</Th>
                  <Th>I admisible corregida</Th>
                  <Th>Verificación</Th>
                </tr>
              </THead>
              <TBody>
                {candidatas.map((c) => (
                  <Tr key={c.seccion} className={cn(c.sugerida && 'bg-brand-50/60')}>
                    <Td className="font-medium">{c.seccion} mm²</Td>
                    <Td>{c.admisible} A</Td>
                    <Td>
                      {c.cumple ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" /> Cumple{c.sugerida && ' · sugerida'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" /> No cumple
                        </span>
                      )}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>
        </>
      }
    />
  );
}
