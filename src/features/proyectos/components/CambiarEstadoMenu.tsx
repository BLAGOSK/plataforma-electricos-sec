import { useState } from 'react';
import { Check, ChevronDown, FileCheck2 } from 'lucide-react';
import { proyectosService } from '@/services/proyectosService';
import type { EstadoProyecto, ProyectoResumen } from '@/types/proyecto';
import { estadosProyecto, flujoProyecto } from '@/utils/estados';
import { cn } from '@/utils/cn';
import { Alert, Button, Dropdown, Input, Modal, useToast } from '@/components/ui';

export function CambiarEstadoMenu({ proyecto }: { proyecto: ProyectoResumen }) {
  const toast = useToast();
  const [modalDeclarar, setModalDeclarar] = useState(false);
  const [folio, setFolio] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cambiar = async (estado: EstadoProyecto) => {
    if (estado === proyecto.estado) return;
    if (estado === 'declarado') {
      setModalDeclarar(true);
      return;
    }
    await proyectosService.cambiarEstado(proyecto.id, estado);
    toast.exito('Estado actualizado', `El proyecto ahora está "${estadosProyecto[estado].label}".`);
  };

  const declarar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await proyectosService.cambiarEstado(proyecto.id, 'declarado', { folioSec: folio, fecha });
      toast.exito('Proyecto declarado', `Folio SEC ${folio}`);
      setModalDeclarar(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const faltan = proyecto.docsRequeridos - proyecto.docsCargados;

  return (
    <>
      <Dropdown
        className="w-64"
        trigger={({ alternar }) => (
          <Button variant="outline" iconRight={ChevronDown} onClick={alternar}>
            Cambiar estado
          </Button>
        )}
      >
        {(cerrar) => (
          <div className="py-1">
            {flujoProyecto.map((e) => (
              <button
                key={e}
                onClick={() => {
                  cerrar();
                  cambiar(e);
                }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50',
                  e === proyecto.estado ? 'font-semibold text-brand-800' : 'text-slate-700',
                )}
              >
                {estadosProyecto[e].label}
                {e === proyecto.estado && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        )}
      </Dropdown>

      <Modal
        abierto={modalDeclarar}
        onClose={() => setModalDeclarar(false)}
        titulo="Registrar declaración SEC"
        descripcion="Ingresa los datos del comprobante entregado por el portal de la SEC."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalDeclarar(false)}>
              Cancelar
            </Button>
            <Button icon={FileCheck2} onClick={declarar} loading={guardando} disabled={!folio.trim()}>
              Marcar como declarado
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {faltan > 0 && (
            <Alert tipo="alerta">
              Faltan {faltan} documento(s) obligatorio(s) según el checklist del tipo {proyecto.tipoTECodigo}.
            </Alert>
          )}
          {error && <Alert tipo="error">{error}</Alert>}
          <Input label="Folio de la declaración" required value={folio} onChange={(e) => setFolio(e.target.value)} placeholder={`${proyecto.tipoTECodigo}-2026-0000000`} />
          <Input label="Fecha de declaración" type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
      </Modal>
    </>
  );
}
