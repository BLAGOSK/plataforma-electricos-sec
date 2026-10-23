import type { ProyectoPayload } from '@/types/proyecto';
import { errorRut } from '@/features/auth/utils/rut';

export interface FormProyecto {
  nombre: string;
  descripcion: string;
  clienteNombre: string;
  clienteRut: string;
  clienteEmail: string;
  clienteTelefono: string;
  direccion: string;
  region: string;
  comuna: string;
  potenciaKw: string;
  tipoTEId: string;
}

export type ErroresProyecto = Partial<Record<keyof FormProyecto, string>>;

export const formProyectoVacio: FormProyecto = {
  nombre: '',
  descripcion: '',
  clienteNombre: '',
  clienteRut: '',
  clienteEmail: '',
  clienteTelefono: '',
  direccion: '',
  region: 'Metropolitana de Santiago',
  comuna: '',
  potenciaKw: '',
  tipoTEId: '',
};

export function validarDatosGenerales(f: FormProyecto): ErroresProyecto {
  const e: ErroresProyecto = {};
  if (f.nombre.trim().length < 4) e.nombre = 'Ingresa un nombre descriptivo (mín. 4 caracteres)';
  if (!f.clienteNombre.trim()) e.clienteNombre = 'Ingresa el nombre del cliente o mandante';
  if (f.clienteRut.trim()) {
    const err = errorRut(f.clienteRut);
    if (err) e.clienteRut = err;
  }
  if (f.clienteEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.clienteEmail.trim())) e.clienteEmail = 'Correo no válido';
  if (!f.direccion.trim()) e.direccion = 'Ingresa la dirección de la instalación';
  if (!f.region) e.region = 'Selecciona la región';
  if (!f.comuna) e.comuna = 'Selecciona la comuna';
  const pot = Number(f.potenciaKw.replace(',', '.'));
  if (!f.potenciaKw.trim() || Number.isNaN(pot) || pot <= 0) e.potenciaKw = 'Ingresa una potencia mayor a 0';
  else if (pot > 100_000) e.potenciaKw = 'Valor fuera de rango';
  return e;
}

export function aPayload(f: FormProyecto): ProyectoPayload {
  return {
    nombre: f.nombre.trim(),
    descripcion: f.descripcion.trim() || undefined,
    cliente: {
      nombre: f.clienteNombre.trim(),
      rut: f.clienteRut.trim() || undefined,
      email: f.clienteEmail.trim() || undefined,
      telefono: f.clienteTelefono.trim() || undefined,
    },
    direccion: f.direccion.trim(),
    region: f.region,
    comuna: f.comuna,
    potenciaKw: Number(f.potenciaKw.replace(',', '.')),
    tipoTEId: f.tipoTEId,
  };
}
