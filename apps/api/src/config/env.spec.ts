import { validarEnv } from './env';

const base = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  WEB_URL: 'http://localhost:5173',
  JWT_ACCESS_SECRET: 'x'.repeat(32),
  S3_BUCKET: 'electricos',
  S3_ACCESS_KEY: 'a',
  S3_SECRET_KEY: 'b',
};

describe('validarEnv', () => {
  it('aplica valores por defecto', () => {
    const env = validarEnv(base);
    expect(env.PORT).toBe(3000);
    expect(env.COOKIE_SECURE).toBe(false);
    expect(env.S3_ENDPOINT).toBeUndefined();
  });

  it('trata las variables vacías como ausentes', () => {
    expect(validarEnv({ ...base, S3_ENDPOINT: '' }).S3_ENDPOINT).toBeUndefined();
  });

  it('falla con un mensaje claro si falta un secreto', () => {
    expect(() => validarEnv({ ...base, JWT_ACCESS_SECRET: 'corto' })).toThrow(/JWT_ACCESS_SECRET/);
  });
});
