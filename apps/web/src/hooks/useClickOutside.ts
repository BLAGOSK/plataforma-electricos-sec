import { useEffect, type RefObject } from 'react';

export function useClickOutside(ref: RefObject<HTMLElement>, onOutside: () => void, activo = true) {
  useEffect(() => {
    if (!activo) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onOutside();
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, onOutside, activo]);
}
