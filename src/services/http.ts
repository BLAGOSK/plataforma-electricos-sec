/**
 * Cliente HTTP para la API real (Fase 2). En la Fase 1 ningún servicio lo usa:
 * todos operan sobre src/mocks/db.ts. Se deja listo para reemplazar la
 * implementación de cada servicio sin cambiar su interfaz.
 */
import { ServiceError } from './mockDelay';

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
export const USE_MOCKS: boolean = (import.meta.env.VITE_USE_MOCKS ?? 'true') !== 'false';

const TOKEN_KEY = 'sec-token';

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function http<T>(ruta: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${ruta}`, { ...init, headers });
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => ({}));
    throw new ServiceError(cuerpo.message ?? `Error ${res.status}`, res.status);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}
