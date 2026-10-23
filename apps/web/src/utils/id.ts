/** Identificador local para elementos creados en formularios (filas editables, etc.). */
export function idLocal(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
