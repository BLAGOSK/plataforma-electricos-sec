/** Minúsculas y sin tildes, para búsquedas tolerantes. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** true si todos los términos de la consulta aparecen en alguno de los campos. */
export function coincide(consulta: string, ...campos: Array<string | undefined>): boolean {
  const terminos = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (!terminos.length) return true;
  const texto = normalizar(campos.filter(Boolean).join(' '));
  return terminos.every((t) => texto.includes(t));
}
