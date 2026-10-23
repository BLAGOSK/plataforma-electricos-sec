/** Simula la latencia de red de la API. */
export function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 150));
}

/** Copia profunda para que los componentes nunca muten la base simulada. */
export function clonar<T>(valor: T): T {
  return structuredClone(valor);
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}
