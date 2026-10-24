/**
 * Fase vigente del proyecto (ver docs/ROADMAP.md). La web y la API la muestran junto a la versión
 * de su package.json; actualizarla al cerrar cada fase.
 */
export const FASE_ACTUAL = {
  numero: 2,
  nombre: 'Backend y base de datos',
} as const;

/** «Fase 2 · v0.2.0» */
export function etiquetaVersion(version: string): string {
  return `Fase ${FASE_ACTUAL.numero} · v${version}`;
}
