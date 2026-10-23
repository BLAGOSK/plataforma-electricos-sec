import { useOutletContext } from 'react-router-dom';
import type { Documento } from '@/types/documento';
import type { ProyectoResumen } from '@/types/proyecto';
import type { TipoTE } from '@/types/tipoTE';

/** Datos compartidos entre las pestañas del detalle de proyecto (vía <Outlet context>). */
export interface ProyectoDetalleContext {
  proyecto: ProyectoResumen;
  tipoTE: TipoTE | null;
  documentos: Documento[];
  /** Solo lectura si el proyecto está declarado */
  soloLectura: boolean;
}

export function useProyectoDetalle(): ProyectoDetalleContext {
  return useOutletContext<ProyectoDetalleContext>();
}
