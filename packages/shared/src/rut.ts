/**
 * Utilidades para el RUT chileno.
 * El dígito verificador se calcula con el algoritmo módulo 11 (serie 2..7).
 */

/** Deja solo dígitos y K mayúscula. */
export function limpiarRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

/** Forma canónica para almacenar y comparar: "12345678-5" (sin puntos, DV en mayúscula). */
export function normalizarRut(rut: string): string {
  const limpio = limpiarRut(rut);
  return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
}

export function calcularDv(cuerpo: string): string {
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

/** Formato aceptado: 12.345.678-5, 12345678-5 o 123456785 (7 u 8 dígitos de cuerpo). */
export function tieneFormatoRut(rut: string): boolean {
  return /^(\d{1,2}\.?\d{3}\.?\d{3})-?[\dkK]$/.test(rut.trim());
}

export function dvEsValido(rut: string): boolean {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return false;
  return calcularDv(limpio.slice(0, -1)) === limpio.slice(-1);
}

export function validarRut(rut: string): boolean {
  return tieneFormatoRut(rut) && dvEsValido(rut);
}

/** Devuelve un mensaje de error o null si el RUT es válido. */
export function errorRut(rut: string): string | null {
  if (!rut.trim()) return 'Ingresa tu RUT';
  if (!tieneFormatoRut(rut)) return 'Formato inválido. Ejemplo: 12.345.678-5';
  if (!dvEsValido(rut)) return 'El dígito verificador no corresponde';
  return null;
}

/** 123456785 → 12.345.678-5 */
export function formatearRut(rut: string): string {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return limpio;
  const cuerpo = limpio.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpo}-${limpio.slice(-1)}`;
}

export function mismoRut(a: string, b: string): boolean {
  return limpiarRut(a) === limpiarRut(b);
}
