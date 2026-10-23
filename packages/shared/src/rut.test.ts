import { describe, expect, it } from 'vitest';
import { calcularDv, errorRut, formatearRut, mismoRut, normalizarRut, validarRut } from './rut';

describe('RUT chileno', () => {
  it('calcula el dígito verificador con módulo 11', () => {
    expect(calcularDv('12345678')).toBe('5');
    expect(calcularDv('11111111')).toBe('1');
    expect(calcularDv('17890123')).toBe('0');
    expect(calcularDv('10000013')).toBe('K');
  });

  it('valida RUT en distintos formatos', () => {
    expect(validarRut('12.345.678-5')).toBe(true);
    expect(validarRut('12345678-5')).toBe(true);
    expect(validarRut('123456785')).toBe(true);
    expect(validarRut('10.000.013-k')).toBe(true);
  });

  it('rechaza dígito verificador incorrecto o formato inválido', () => {
    expect(validarRut('12.345.678-9')).toBe(false);
    expect(validarRut('abc')).toBe(false);
    expect(errorRut('')).toMatch(/Ingresa/);
    expect(errorRut('12-3')).toMatch(/Formato/);
    expect(errorRut('12.345.678-9')).toMatch(/dígito verificador/);
    expect(errorRut('12.345.678-5')).toBeNull();
  });

  it('normaliza y formatea', () => {
    expect(normalizarRut('12.345.678-5')).toBe('12345678-5');
    expect(normalizarRut('10000013k')).toBe('10000013-K');
    expect(formatearRut('123456785')).toBe('12.345.678-5');
    expect(mismoRut('12.345.678-5', '12345678-5')).toBe(true);
  });
});
