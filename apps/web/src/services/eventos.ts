/**
 * Bus de cambios mínimo: los servicios avisan cuando mutan datos y las vistas
 * que dependen de ellos (sidebar, badges, contadores) se vuelven a cargar.
 * En la Fase 2 puede alimentarse desde WebSockets/SSE sin cambiar las vistas.
 */
import { useEffect, useState } from 'react';

export type Tema = 'usuarios' | 'extensiones' | 'notificaciones' | 'proyectos' | 'contenidos' | 'asesorias' | 'chat';

const listeners = new Map<Tema, Set<() => void>>();

export function emitirCambio(...temas: Tema[]): void {
  temas.forEach((t) => listeners.get(t)?.forEach((fn) => fn()));
}

/** Devuelve un número que cambia cada vez que se emite un cambio del tema. Úsalo como dependencia. */
export function useVersion(tema: Tema): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const fn = () => setVersion((v) => v + 1);
    if (!listeners.has(tema)) listeners.set(tema, new Set());
    listeners.get(tema)!.add(fn);
    return () => {
      listeners.get(tema)!.delete(fn);
    };
  }, [tema]);
  return version;
}
