import { useState } from 'react';
import { Input, Select, Table, TBody, Td, Th, THead, Tr } from '@/components/ui';
import { HerramientaLayout, Indicador } from '../components/HerramientaLayout';

const tramos = [
  { tramo: 'Empalme → TG', longitud: 12, seccion: '16', caida: 0.42 },
  { tramo: 'TG → TDS', longitud: 35, seccion: '6', caida: 1.18 },
  { tramo: 'TDS → C4 (último punto)', longitud: 18, seccion: '2,5', caida: 0.65 },
];

export function CaidaTension({ proyectoNombre }: { proyectoNombre?: string }) {
  const [f, setF] = useState({ sistema: 'trifasico', tension: '380', corriente: '24,5', longitud: '35', seccion: '6', material: 'cu', fp: '0,93', limite: '3' });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const total = tramos.reduce((s, t) => s + t.caida, 0);
  const limite = Number(f.limite.replace(',', '.')) || 3;
  const pct = Math.min(100, (total / limite) * 100);

  return (
    <HerramientaLayout
      proyectoNombre={proyectoNombre}
      entradas={
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Sistema" value={f.sistema} onChange={set('sistema')} opciones={[{ value: 'monofasico', label: 'Monofásico' }, { value: 'trifasico', label: 'Trifásico' }]} />
          <Select label="Tensión nominal" value={f.tension} onChange={set('tension')} opciones={[{ value: '220', label: '220 V' }, { value: '380', label: '380 V' }]} />
          <Input label="Corriente" sufijo="A" value={f.corriente} onChange={set('corriente')} inputMode="decimal" />
          <Input label="Longitud" sufijo="m" value={f.longitud} onChange={set('longitud')} inputMode="decimal" />
          <Select
            label="Sección"
            value={f.seccion}
            onChange={set('seccion')}
            opciones={['1,5', '2,5', '4', '6', '10', '16', '25', '35'].map((s) => ({ value: s, label: `${s} mm²` }))}
          />
          <Select label="Material" value={f.material} onChange={set('material')} opciones={[{ value: 'cu', label: 'Cobre' }, { value: 'al', label: 'Aluminio' }]} />
          <Input label="Factor de potencia" value={f.fp} onChange={set('fp')} inputMode="decimal" />
          <Input label="Límite admisible" sufijo="%" value={f.limite} onChange={set('limite')} inputMode="decimal" hint="Valor referencial a validar" />
        </div>
      }
      resultados={
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Indicador label="Caída en el tramo" valor="4,48" unidad="V" />
            <Indicador label="Caída acumulada" valor={total.toFixed(2).replace('.', ',')} unidad="%" destacado />
            <Indicador label="Verificación" valor={total <= limite ? 'Cumple' : 'No cumple'} estado={total <= limite ? 'ok' : 'error'} />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>0 %</span>
              <span>Límite {limite} %</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div className={total <= limite ? 'h-full bg-emerald-500' : 'h-full bg-red-500'} style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">Caída por tramo</p>
            <Table>
              <THead>
                <tr>
                  <Th>Tramo</Th>
                  <Th>Longitud</Th>
                  <Th>Sección</Th>
                  <Th className="text-right">ΔV %</Th>
                </tr>
              </THead>
              <TBody>
                {tramos.map((t) => (
                  <Tr key={t.tramo}>
                    <Td>{t.tramo}</Td>
                    <Td>{t.longitud} m</Td>
                    <Td>{t.seccion} mm²</Td>
                    <Td className="text-right tabular-nums">{t.caida.toFixed(2).replace('.', ',')}</Td>
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
