import { z } from 'zod';

/** Trata "" como ausente (las variables vacías del .env no deben pasar como valores). */
const opcional = <T extends z.ZodTypeAny>(schema: T) => z.preprocess((v) => (v === '' ? undefined : v), schema.optional());
const booleano = z.enum(['true', 'false']).transform((v) => v === 'true');

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().url(),

  /** Origen del frontend: CORS y enlaces en correos */
  WEB_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET debe tener al menos 32 caracteres'),
  JWT_ACCESS_TTL_SEG: z.coerce.number().int().positive().default(900),
  REFRESH_TTL_DIAS: z.coerce.number().int().positive().default(7),
  COOKIE_SECURE: booleano.default('false'),

  /** Vacío = AWS S3. Con valor = MinIO u otro proveedor compatible. */
  S3_ENDPOINT: opcional(z.string().url()),
  /** Endpoint que verá el navegador en las URLs prefirmadas (si difiere del interno). */
  S3_PUBLIC_ENDPOINT: opcional(z.string().url()),
  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().min(3),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_FORCE_PATH_STYLE: booleano.default('true'),
  /** Crear el bucket al iniciar si no existe (útil en desarrollo). */
  S3_CREAR_BUCKET: booleano.default('false'),
  PRESIGN_TTL_SEG: z.coerce.number().int().min(30).max(3600).default(300),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(50),

  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().int().default(1025),
  SMTP_USER: opcional(z.string()),
  SMTP_PASS: opcional(z.string()),
  SMTP_SECURE: booleano.default('false'),
  MAIL_FROM: z.string().default('Plataforma Eléctricos SEC <no-responder@electricos-sec.local>'),
});

export type Env = z.infer<typeof envSchema>;

export function validarEnv(fuente: Record<string, string | undefined>): Env {
  const r = envSchema.safeParse(fuente);
  if (!r.success) {
    const detalle = r.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Configuración inválida. Revisa apps/api/.env:\n${detalle}`);
  }
  return r.data;
}
