import { describe, expect, it } from 'vitest';
import { FASE_ACTUAL, etiquetaVersion } from './version';

describe('versión de la plataforma', () => {
  it('combina la fase vigente con la versión', () => {
    expect(etiquetaVersion('0.2.0')).toBe(`Fase ${FASE_ACTUAL.numero} · v0.2.0`);
  });
});
