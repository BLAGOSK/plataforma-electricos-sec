import { useCallback, useEffect, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * Ejecuta una función asíncrona (normalmente un servicio) y expone su estado.
 * Se vuelve a ejecutar cuando cambian las dependencias.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, loading: true, error: null });
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(() => {
    let cancelado = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fnRef
      .current()
      .then((data) => !cancelado && setState({ data, loading: false, error: null }))
      .catch((error: Error) => !cancelado && setState({ data: undefined, loading: false, error }));
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);

  const setData = useCallback((data: T) => setState((s) => ({ ...s, data })), []);

  return { ...state, reload: run, setData };
}
