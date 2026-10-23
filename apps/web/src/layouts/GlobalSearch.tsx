import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, Search } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useDebounce } from '@/hooks/useDebounce';
import { busquedaService, type ResultadoBusqueda } from '@/services/busquedaService';
import { cn } from '@/utils/cn';
import { Spinner } from '@/components/ui';

export function GlobalSearch() {
  const usuario = useUsuario();
  const navigate = useNavigate();
  const [consulta, setConsulta] = useState('');
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounce(consulta, 200);

  const cerrar = useCallback(() => setAbierto(false), []);
  useClickOutside(contenedorRef, cerrar, abierto);

  useEffect(() => {
    let cancelado = false;
    if (debounced.trim().length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    busquedaService.buscar(debounced, usuario).then((r) => {
      if (cancelado) return;
      setResultados(r);
      setActivo(0);
      setBuscando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [debounced, usuario]);

  // Atajo Ctrl/Cmd + K
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setAbierto(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const ir = (r: ResultadoBusqueda) => {
    navigate(r.to);
    setConsulta('');
    setAbierto(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActivo((a) => Math.min(a + 1, resultados.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActivo((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && resultados[activo]) {
      ir(resultados[activo]);
    }
  };

  const grupos = resultados.reduce<Record<string, ResultadoBusqueda[]>>((acc, r) => {
    (acc[r.grupo] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div ref={contenedorRef} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        ref={inputRef}
        type="search"
        value={consulta}
        onChange={(e) => {
          setConsulta(e.target.value);
          setAbierto(true);
        }}
        onFocus={() => setAbierto(true)}
        onKeyDown={onKeyDown}
        placeholder="Buscar proyectos, normativa, asesores…"
        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-14 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        aria-label="Buscar en la plataforma"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 text-[10px] font-medium text-slate-400 md:block">
        Ctrl K
      </kbd>

      {abierto && consulta.trim().length >= 2 && (
        <div className="absolute left-0 right-0 z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
          {buscando && resultados.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
              <Spinner className="h-4 w-4" /> Buscando…
            </div>
          ) : resultados.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">Sin resultados para “{consulta}”.</p>
          ) : (
            Object.entries(grupos).map(([grupo, items]) => (
              <div key={grupo} className="py-1">
                <p className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{grupo}</p>
                {items.map((r) => {
                  const idx = resultados.indexOf(r);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onMouseEnter={() => setActivo(idx)}
                      onClick={() => ir(r)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 px-4 py-2 text-left',
                        idx === activo ? 'bg-brand-50' : 'hover:bg-slate-50',
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-800">{r.titulo}</span>
                        {r.subtitulo && <span className="block truncate text-xs text-slate-500">{r.subtitulo}</span>}
                      </span>
                      {idx === activo && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
