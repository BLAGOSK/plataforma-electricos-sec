import { etiquetaVersion } from '@electricos/shared';
import { formatFechaHora } from './format';

/** «Fase 2 · v0.2.0»: fase del proyecto (@electricos/shared) y versión de apps/web/package.json. */
export const ETIQUETA_VERSION = etiquetaVersion(__APP_VERSION__);

/** «Compilado el …», para el `title` de la etiqueta de versión. */
export const DETALLE_BUILD = `Compilado el ${formatFechaHora(__APP_BUILD__)}`;
