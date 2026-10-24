import { useState, type FormEvent, type ReactNode } from 'react';
import { Calculator, FileDown, FolderInput, RotateCcw } from 'lucide-react';
import { Alert, Button, Card, CardBody, CardFooter, CardHeader, EmptyState, useToast } from '@/components/ui';
import { cn } from '@/utils/cn';

interface Props {
  entradas: ReactNode;
  /** Se renderiza tras pulsar "Calcular" */
  resultados: ReactNode;
  proyectoNombre?: string;
  /** Ancho de la columna de entradas */
  anchoEntradas?: 'normal' | 'angosto';
}

/** Estructura común de una herramienta: datos de entrada + resultados de ejemplo. */
export function HerramientaLayout({ entradas, resultados, proyectoNombre, anchoEntradas = 'normal' }: Props) {
  const toast = useToast();
  const [calculado, setCalculado] = useState(false);
  const [calculando, setCalculando] = useState(false);

  const calcular = (e: FormEvent) => {
    e.preventDefault();
    setCalculando(true);
    setTimeout(() => {
      setCalculando(false);
      setCalculado(true);
    }, 600);
  };

  return (
    <div className={cn('grid gap-6', anchoEntradas === 'angosto' ? 'xl:grid-cols-[22rem_1fr]' : 'lg:grid-cols-2')}>
      <form onSubmit={calcular}>
        <Card>
          <CardHeader title="Datos de entrada" />
          <CardBody className="space-y-4">{entradas}</CardBody>
          <CardFooter className="justify-between">
            <Button variant="ghost" icon={RotateCcw} onClick={() => setCalculado(false)}>
              Limpiar resultados
            </Button>
            <Button type="submit" icon={Calculator} loading={calculando}>
              Calcular
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Card className="h-fit">
        <CardHeader
          title="Resultados"
          actions={
            calculado && (
              <>
                {proyectoNombre && (
                  <Button size="sm" variant="secondary" icon={FolderInput} onClick={() => toast.info('Función disponible próximamente', `El resultado se adjuntará al proyecto "${proyectoNombre}".`)}>
                    Guardar en proyecto
                  </Button>
                )}
                <Button size="sm" variant="outline" icon={FileDown} onClick={() => toast.info('Función disponible próximamente', 'Exportación de la memoria de cálculo a PDF.')}>
                  Exportar
                </Button>
              </>
            )
          }
        />
        <CardBody>
          {calculado ? (
            <div className="space-y-5">
              <Alert tipo="alerta">
                <strong>Resultados de ejemplo.</strong> Los cálculos reales se implementarán en una fase posterior; los valores son ilustrativos.
              </Alert>
              {resultados}
            </div>
          ) : (
            <EmptyState icon={Calculator} titulo="Sin resultados" descripcion="Completa los datos de entrada y presiona «Calcular» para ver un resultado de ejemplo." />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

/** Tarjeta de indicador para resultados. */
export function Indicador({ label, valor, unidad, destacado, estado }: { label: string; valor: string; unidad?: string; destacado?: boolean; estado?: 'ok' | 'error' }) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        destacado ? 'border-brand-200 bg-brand-50' : 'border-slate-200',
        estado === 'ok' && 'border-emerald-200 bg-emerald-50',
        estado === 'error' && 'border-red-200 bg-red-50',
      )}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-slate-900">
        {valor}
        {unidad && <span className="ml-1 text-sm font-medium text-slate-500">{unidad}</span>}
      </p>
    </div>
  );
}
