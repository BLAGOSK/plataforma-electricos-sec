export interface FortalezaPassword {
  /** 0 (vacía) a 4 (muy segura) */
  puntaje: 0 | 1 | 2 | 3 | 4;
  etiqueta: string;
  requisitos: Array<{ texto: string; cumple: boolean }>;
}

export const LARGO_MINIMO_PASSWORD = 8;

export function evaluarPassword(pw: string): FortalezaPassword {
  const requisitos = [
    { texto: `Al menos ${LARGO_MINIMO_PASSWORD} caracteres`, cumple: pw.length >= LARGO_MINIMO_PASSWORD },
    { texto: 'Mayúsculas y minúsculas', cumple: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { texto: 'Al menos un número', cumple: /\d/.test(pw) },
    { texto: 'Al menos un símbolo (!@#$…)', cumple: /[^A-Za-z0-9]/.test(pw) },
  ];
  if (!pw) return { puntaje: 0, etiqueta: '', requisitos };

  let puntaje = requisitos.filter((r) => r.cumple).length;
  if (pw.length < LARGO_MINIMO_PASSWORD) puntaje = Math.min(puntaje, 1);
  if (pw.length >= 12 && puntaje >= 3) puntaje = 4;
  const p = Math.max(1, Math.min(4, puntaje)) as 1 | 2 | 3 | 4;
  const etiquetas = { 1: 'Débil', 2: 'Regular', 3: 'Buena', 4: 'Muy segura' } as const;
  return { puntaje: p, etiqueta: etiquetas[p], requisitos };
}

/** Requisito mínimo para aceptar la contraseña. */
export function passwordAceptable(pw: string): boolean {
  return evaluarPassword(pw).puntaje >= 3;
}
