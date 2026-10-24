import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Versión leída de apps/api/package.json (src/ y dist/ están al mismo nivel, así que la ruta sirve
 * en desarrollo, en pruebas y en la imagen Docker, que copia el package.json).
 */
export const VERSION_API: string = (JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')) as { version: string }).version;
