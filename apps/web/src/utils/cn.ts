/** Une clases CSS ignorando valores falsy. */
export function cn(...clases: Array<string | number | false | null | undefined>): string {
  return clases.filter(Boolean).join(' ');
}
