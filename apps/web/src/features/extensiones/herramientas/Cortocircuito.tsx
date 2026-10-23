import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Input, Select, Table, TBody, Td, Th, THead, Tr } from '@/components/ui';
import { HerramientaLayout, Indicador } from '../components/HerramientaLayout';

const protecciones = [
  { nombre: 'Interruptor general TG', poder: 25, icc: 9.8 },
  { nombre: 'Alimentador TDS', poder: 10, icc: 6.2 },
  { nombre: 'Circuitos TDS (C1–C10)', poder: 6, icc: 6.2 },
];

export function Cortocircuito({ proyectoNombre }: { proyectoNombre?: string }) {
  const [f, setF] = useState({ origen: 'transformador', potenciaTrafo: '300', ucc: '4', tension: '400', sccRed: '250', longitud: '35', seccion: '6', material: 'cu', punto: 'tds' });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  return (
    <HerramientaLayout
      proyectoNombre={proyectoNombre}
      entradas={
        <>
          <Select
            label="Origen del suministro"
            value={f.origen}
            onChange={set('origen')}
            opciones={[
              { value: 'transformador', label: 'Transformador propio' },
              { value: 'red_bt', label: 'Red de distribución BT' },
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {f.origen === 'transformador' ? (
              <>
                <Input label="Potencia del transformador" sufijo="kVA" value={f.potenciaTrafo} onChange={set('potenciaTrafo')} inputMode="decimal" />
                <Input label="Tensión de cortocircuito (Ucc)" sufijo="%" value={f.ucc} onChange={set('ucc')} inputMode="decimal" />
              </>
            ) : (
              <Input label="Potencia de cortocircuito de la red" sufijo="MVA" value={f.sccRed} onChange={set('sccRed')} inputMode="decimal" />
            )}
            <Input label="Tensión secundaria" sufijo="V" value={f.tension} onChange={set('tension')} inputMode="numeric" />
          </div>
          <p className="pt-2 text-sm font-semibold text-slate-900">Alimentador hasta el punto de falla</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Longitud" sufijo="m" value={f.longitud} onChange={set('longitud')} inputMode="decimal" />
            <Select label="Sección" value={f.seccion} onChange={set('seccion')} opciones={['4', '6', '10', '16', '25', '35', '50', '70'].map((s) => ({ value: s, label: `${s} mm²` }))} />
            <Select label="Material" value={f.material} onChange={set('material')} opciones={[{ value: 'cu', label: 'Cobre' }, { value: 'al', label: 'Aluminio' }]} />
          </div>
          <Select
            label="Punto de falla"
            value={f.punto}
            onChange={set('punto')}
            opciones={[
              { value: 'tg', label: 'Barra tablero general (TG)' },
              { value: 'tds', label: 'Barra tablero secundario (TDS)' },
            ]}
          />
        </>
      }
      resultados={
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Indicador label="Icc trifásica" valor="6,2" unidad="kA" destacado />
            <Indicador label="Icc monofásica" valor="3,9" unidad="kA" />
            <Indicador label="Impedancia total" valor="37,3" unidad="mΩ" />
            <Indicador label="Ip (valor peak)" valor="11,4" unidad="kA" />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">Verificación de capacidad de ruptura</p>
            <Table>
              <THead>
                <tr>
                  <Th>Protección</Th>
                  <Th>Poder de corte</Th>
                  <Th>Icc en el punto</Th>
                  <Th>Resultado</Th>
                </tr>
              </THead>
              <TBody>
                {protecciones.map((p) => {
                  const ok = p.poder >= p.icc;
                  return (
                    <Tr key={p.nombre}>
                      <Td>{p.nombre}</Td>
                      <Td>{p.poder} kA</Td>
                      <Td>{p.icc.toString().replace('.', ',')} kA</Td>
                      <Td>
                        {ok ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" /> Adecuada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <XCircle className="h-4 w-4" /> Insuficiente
                          </span>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </TBody>
            </Table>
          </div>
        </>
      }
    />
  );
}
