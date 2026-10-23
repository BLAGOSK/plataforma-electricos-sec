import { describe, expect, it } from 'vitest';
import { errorTipoArchivo, sanearNombreArchivo } from './archivos';
import { evaluarPassword, passwordAceptable } from './password';

describe('archivos', () => {
  it('sanea nombres peligrosos o con tildes', () => {
    expect(sanearNombreArchivo('../../etc/passwd')).toBe('passwd');
    expect(sanearNombreArchivo('C:\\fakepath\\Memoria de cálculo (rev B).pdf')).toBe('Memoria_de_calculo_rev_B_.pdf');
    expect(sanearNombreArchivo('.oculto.pdf')).toBe('oculto.pdf');
    expect(sanearNombreArchivo('a'.repeat(300) + '.dwg').length).toBeLessThanOrEqual(120);
  });

  it('valida extensión y MIME', () => {
    expect(errorTipoArchivo('plano.pdf', 'application/pdf')).toBeNull();
    expect(errorTipoArchivo('plano.dwg', 'application/octet-stream')).toBeNull();
    expect(errorTipoArchivo('script.exe', 'application/x-msdownload')).toMatch(/no permitido/);
    expect(errorTipoArchivo('falso.pdf', 'image/png')).toMatch(/no corresponde/);
  });
});

describe('contraseñas', () => {
  it('evalúa la fortaleza', () => {
    expect(passwordAceptable('demo1234')).toBe(false);
    expect(passwordAceptable('Demo1234!')).toBe(true);
    expect(evaluarPassword('Una-Clave-Muy-Larga-2026').puntaje).toBe(4);
  });
});
