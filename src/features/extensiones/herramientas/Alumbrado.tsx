import { useMemo, useState } from 'react';
import { Input, Select } from '@/components/ui';
import { HerramientaLayout, Indicador } from '../components/HerramientaLayout';

const recintos = [
  { value: 'oficina', label: 'Oficina', lux: 500 },
  { value: 'sala_clases', label: 'Sala de clases', lux: 500 },
  { value: 'local', label: 'Local comercial', lux: 300 },
  { value: 'bodega', label: 'Bodega', lux: 200 },
  { value: 'pasillo', label: 'Pasillo', lux: 100 },
];

const luminarias = [
  { value: 'panel', label: 'Panel LED 60×60 · 40 W · 4.000 lm', w: 40 },
  { value: 'lineal', label: 'Lineal LED 120 cm · 36 W · 4.300 lm', w: 36 },
  { value: 'downlight', label: 'Downlight LED · 18 W · 1.800 lm', w: 18 },
  { value: 'campana', label: 'Campana LED · 100 W · 13.000 lm', w: 100 },
];

/** Color de la grilla isolux de ejemplo (de azul a amarillo). */
function colorLux(t: number) {
  const h = 220 - t * 170;
  return `hsl(${h} 85% ${55 + t * 10}%)`;
}

function GrillaRecinto({ largo, ancho, filas, columnas }: { largo: number; ancho: number; filas: number; columnas: number }) {
  const escala = 300 / Math.max(largo, ancho);
  const w = largo * escala;
  const h = ancho * escala;
  const celdas = 14;
  const lums = useMemo(
    () =>
      Array.from({ length: filas * columnas }, (_, i) => ({
        x: ((i % columnas) + 0.5) * (w / columnas),
        y: (Math.floor(i / columnas) + 0.5) * (h / filas),
      })),
    [filas, columnas, w, h],
  );

  // Mapa de calor ilustrativo: más intensidad cerca de cada luminaria.
  const grilla = useMemo(() => {
    const cw = w / celdas;
    const ch = h / celdas;
    const r = Math.max(w / columnas, h / filas) * 0.9;
    return Array.from({ length: celdas * celdas }, (_, i) => {
      const cx = ((i % celdas) + 0.5) * cw;
      const cy = (Math.floor(i / celdas) + 0.5) * ch;
      const v = lums.reduce((s, l) => s + Math.max(0, 1 - Math.hypot(l.x - cx, l.y - cy) / r), 0);
      return { x: (i % celdas) * cw, y: Math.floor(i / celdas) * ch, cw, ch, t: Math.min(1, v / 1.6) };
    });
  }, [lums, w, h, filas, columnas]);

  return (
    <div>
      <svg viewBox={`-30 -20 ${w + 50} ${h + 50}`} className="w-full max-w-lg" role="img" aria-label="Distribución de luminarias en el recinto">
        {grilla.map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={c.cw + 0.5} height={c.ch + 0.5} fill={colorLux(c.t)} opacity={0.55} />
        ))}
        <rect x={0} y={0} width={w} height={h} fill="none" stroke="#0f172a" strokeWidth={2} />
        {lums.map((l, i) => (
          <g key={i}>
            <rect x={l.x - 8} y={l.y - 8} width={16} height={16} fill="#fff" stroke="#1d4ed8" strokeWidth={2} />
            <line x1={l.x - 8} y1={l.y - 8} x2={l.x + 8} y2={l.y + 8} stroke="#1d4ed8" strokeWidth={1} />
            <line x1={l.x + 8} y1={l.y - 8} x2={l.x - 8} y2={l.y + 8} stroke="#1d4ed8" strokeWidth={1} />
          </g>
        ))}
        <text x={w / 2} y={h + 22} textAnchor="middle" fontSize={11} fill="#475569">
          {largo.toLocaleString('es-CL')} m
        </text>
        <text x={-12} y={h / 2} textAnchor="middle" fontSize={11} fill="#475569" transform={`rotate(-90 -12 ${h / 2})`}>
          {ancho.toLocaleString('es-CL')} m
        </text>
      </svg>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
        <span>Menor</span>
        <span className="h-2 w-32 rounded-full" style={{ background: `linear-gradient(to right, ${colorLux(0)}, ${colorLux(0.5)}, ${colorLux(1)})` }} />
        <span>Mayor iluminancia (ilustrativo)</span>
      </div>
    </div>
  );
}

export function Alumbrado({ proyectoNombre }: { proyectoNombre?: string }) {
  const [f, setF] = useState({
    largo: '12',
    ancho: '8',
    alto: '2,8',
    planoTrabajo: '0,85',
    recinto: 'oficina',
    lux: '500',
    luminaria: 'panel',
    techo: '0,7',
    paredes: '0,5',
    suelo: '0,2',
    mantenimiento: '0,8',
  });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const num = (v: string, d: number) => Math.max(1, Number(v.replace(',', '.')) || d);
  const largo = Math.min(num(f.largo, 12), 200);
  const ancho = Math.min(num(f.ancho, 8), 200);
  // Distribución de ejemplo proporcional a la forma del recinto (sin cálculo lumínico real)
  const total = 12;
  const columnas = Math.max(1, Math.round(Math.sqrt(total * (largo / ancho))));
  const filas = Math.max(1, Math.round(total / columnas));
  const lum = luminarias.find((l) => l.value === f.luminaria)!;
  const area = largo * ancho;

  return (
    <HerramientaLayout
      anchoEntradas="angosto"
      proyectoNombre={proyectoNombre}
      entradas={
        <>
          <p className="text-sm font-semibold text-slate-900">Recinto</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Largo" sufijo="m" value={f.largo} onChange={set('largo')} inputMode="decimal" />
            <Input label="Ancho" sufijo="m" value={f.ancho} onChange={set('ancho')} inputMode="decimal" />
            <Input label="Altura" sufijo="m" value={f.alto} onChange={set('alto')} inputMode="decimal" />
            <Input label="Plano de trabajo" sufijo="m" value={f.planoTrabajo} onChange={set('planoTrabajo')} inputMode="decimal" />
          </div>
          <Select
            label="Tipo de recinto"
            value={f.recinto}
            onChange={(e) => setF({ ...f, recinto: e.target.value, lux: String(recintos.find((r) => r.value === e.target.value)?.lux ?? f.lux) })}
            opciones={recintos.map((r) => ({ value: r.value, label: `${r.label} (${r.lux} lx)` }))}
          />
          <Input label="Iluminancia objetivo" sufijo="lx" value={f.lux} onChange={set('lux')} inputMode="numeric" hint="Valor referencial a validar" />
          <p className="pt-2 text-sm font-semibold text-slate-900">Luminaria y reflectancias</p>
          <Select label="Luminaria" value={f.luminaria} onChange={set('luminaria')} opciones={luminarias.map((l) => ({ value: l.value, label: l.label }))} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Techo" value={f.techo} onChange={set('techo')} inputMode="decimal" />
            <Input label="Paredes" value={f.paredes} onChange={set('paredes')} inputMode="decimal" />
            <Input label="Suelo" value={f.suelo} onChange={set('suelo')} inputMode="decimal" />
          </div>
          <Input label="Factor de mantenimiento" value={f.mantenimiento} onChange={set('mantenimiento')} inputMode="decimal" />
        </>
      }
      resultados={
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Indicador label="Luminarias" valor={String(filas * columnas)} unidad="u" destacado />
            <Indicador label="Em obtenida" valor="528" unidad="lx" estado="ok" />
            <Indicador label="Uniformidad U0" valor="0,62" />
            <Indicador label="Potencia instalada" valor={`${(filas * columnas * lum.w).toLocaleString('es-CL')}`} unidad="W" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Indicador label="Distribución" valor={`${filas} × ${columnas}`} unidad="filas × columnas" />
            <Indicador label="Densidad de potencia" valor={((filas * columnas * lum.w) / area).toFixed(1).replace('.', ',')} unidad="W/m²" />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">Vista en planta del recinto</p>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <GrillaRecinto largo={largo} ancho={ancho} filas={filas} columnas={columnas} />
            </div>
          </div>
        </>
      }
    />
  );
}
