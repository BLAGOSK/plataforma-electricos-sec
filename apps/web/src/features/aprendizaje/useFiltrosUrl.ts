import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';

/** Filtros de búsqueda/TE/categoría sincronizados con la URL (?q=&te=&cat=). */
export function useFiltrosUrl() {
  const [params, setParams] = useSearchParams();
  const [busqueda, setBusquedaLocal] = useState(params.get('q') ?? '');
  const q = useDebounce(busqueda, 250);

  const set = (clave: string, valor: string) => {
    const nuevos = new URLSearchParams(params);
    if (valor) nuevos.set(clave, valor);
    else nuevos.delete(clave);
    setParams(nuevos, { replace: true });
  };

  return {
    busqueda,
    q,
    tipoTEId: params.get('te') ?? '',
    categoria: params.get('cat') ?? '',
    setBusqueda: (v: string) => {
      setBusquedaLocal(v);
      set('q', v);
    },
    setTipoTE: (v: string) => set('te', v),
    setCategoria: (v: string) => set('cat', v),
    limpiar: () => {
      setBusquedaLocal('');
      setParams({}, { replace: true });
    },
  };
}
