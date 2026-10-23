import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FolderKanban, FolderOpen, MapPin, Plus, Search, X, Zap } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { useDebounce } from '@/hooks/useDebounce';
import { proyectosService } from '@/services/proyectosService';
import { tiposTEService } from '@/services/tiposTEService';
import { useVersion } from '@/services/eventos';
import type { EstadoProyecto } from '@/types/proyecto';
import { estadosProyecto, flujoProyecto } from '@/utils/estados';
import { cn } from '@/utils/cn';
import { formatFecha, formatNumero } from '@/utils/format';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button, ButtonLink, Card, Cargando, EmptyState, Select, Table, TBody, Td, Th, THead, Tr } from '@/components/ui';
import { ProgresoDocumental } from '../components/ProgresoDocumental';
import { TipoTEBadge } from '../components/TipoTEBadge';

export function ProyectosListPage() {
  const usuario = useUsuario();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const version = useVersion('proyectos');

  const tipoTEId = params.get('tipo') ?? '';
  const estado = (params.get('estado') ?? '') as EstadoProyecto | '';
  const [busqueda, setBusqueda] = useState(params.get('q') ?? '');
  const q = useDebounce(busqueda, 250);

  const actualizarParam = (clave: string, valor: string) => {
    const nuevos = new URLSearchParams(params);
    if (valor) nuevos.set(clave, valor);
    else nuevos.delete(clave);
    setParams(nuevos, { replace: true });
  };

  const { data: tipos = [] } = useAsync(() => tiposTEService.listar(), [version]);
  const { data: conteo } = useAsync(() => proyectosService.contarPorEstado(usuario), [usuario, version]);
  const { data: proyectos, loading } = useAsync(
    () => proyectosService.listar(usuario, { q, tipoTEId: tipoTEId || undefined, estado: estado || undefined }),
    [usuario, q, tipoTEId, estado, version],
  );

  const total = conteo ? Object.values(conteo).reduce((a, b) => a + b, 0) : 0;
  const hayFiltros = !!(q || tipoTEId || estado);
  const esAdmin = usuario.rol === 'admin';

  return (
    <div>
      <PageHeader
        titulo="Proyectos eléctricos"
        descripcion={esAdmin ? 'Todos los proyectos registrados en la plataforma.' : 'Gestiona tus proyectos, su documentación y la declaración ante la SEC.'}
        icon={FolderKanban}
        acciones={
          <ButtonLink to="/proyectos/nuevo" icon={Plus}>
            Nuevo proyecto
          </ButtonLink>
        }
      />

      {/* Filtro por estado */}
      <div className="scrollbar-thin mb-4 flex gap-2 overflow-x-auto pb-1">
        {[{ value: '' as const, label: 'Todos', n: total }, ...flujoProyecto.map((e) => ({ value: e, label: estadosProyecto[e].label, n: conteo?.[e] ?? 0 }))].map(
          (f) => (
            <button
              key={f.value || 'todos'}
              onClick={() => actualizarParam('estado', f.value)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                estado === f.value
                  ? 'border-brand-700 bg-brand-700 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
              )}
            >
              {f.label}
              <span className={cn('rounded-full px-1.5 text-xs', estado === f.value ? 'bg-white/20' : 'bg-slate-100')}>{f.n}</span>
            </button>
          ),
        )}
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                actualizarParam('q', e.target.value);
              }}
              placeholder="Buscar por nombre, código, cliente o comuna…"
              className="form-control pl-9"
              aria-label="Buscar proyectos"
            />
          </div>
          <Select
            containerClassName="sm:w-72"
            value={tipoTEId}
            onChange={(e) => actualizarParam('tipo', e.target.value)}
            placeholder="Todos los tipos TE"
            opciones={tipos.map((t) => ({ value: t.id, label: `${t.codigo} — ${t.nombre}` }))}
            aria-label="Filtrar por tipo TE"
          />
          {hayFiltros && (
            <Button
              variant="ghost"
              icon={X}
              onClick={() => {
                setBusqueda('');
                setParams({}, { replace: true });
              }}
            >
              Limpiar
            </Button>
          )}
        </div>

        {loading && !proyectos ? (
          <Cargando />
        ) : !proyectos?.length ? (
          <EmptyState
            icon={FolderOpen}
            titulo={hayFiltros ? 'No hay proyectos que coincidan' : 'Aún no tienes proyectos'}
            descripcion={hayFiltros ? 'Prueba con otros filtros o términos de búsqueda.' : 'Crea tu primer proyecto para comenzar a gestionar su documentación.'}
            accion={!hayFiltros && <ButtonLink to="/proyectos/nuevo" icon={Plus}>Crear proyecto</ButtonLink>}
          />
        ) : (
          <>
            {/* Escritorio: tabla */}
            <div className="hidden md:block">
              <Table>
                <THead>
                  <tr>
                    <Th>Proyecto</Th>
                    <Th>Tipo</Th>
                    <Th>Cliente / ubicación</Th>
                    <Th className="text-right">Potencia</Th>
                    <Th>Documentación</Th>
                    <Th>Estado</Th>
                    <Th>Actualizado</Th>
                  </tr>
                </THead>
                <TBody>
                  {proyectos.map((p) => (
                    <Tr key={p.id} className="cursor-pointer" onClick={() => navigate(`/proyectos/${p.id}`)}>
                      <Td className="max-w-xs">
                        <p className="truncate font-medium text-slate-900">{p.nombre}</p>
                        <p className="text-xs text-slate-500">
                          {p.codigo}
                          {esAdmin && ` · ${p.responsableNombre}`}
                        </p>
                      </Td>
                      <Td>
                        <TipoTEBadge codigo={p.tipoTECodigo} nombre={p.tipoTENombre} />
                      </Td>
                      <Td className="max-w-[14rem]">
                        <p className="truncate">{p.cliente.nombre}</p>
                        <p className="truncate text-xs text-slate-500">{p.comuna}</p>
                      </Td>
                      <Td className="whitespace-nowrap text-right tabular-nums">{formatNumero(p.potenciaKw, 1)} kW</Td>
                      <Td>
                        <ProgresoDocumental compacto cargados={p.docsCargados} requeridos={p.docsRequeridos} />
                      </Td>
                      <Td>
                        <StatusBadge dominio="proyecto" estado={p.estado} />
                      </Td>
                      <Td className="whitespace-nowrap text-slate-500">{formatFecha(p.fechaActualizacion)}</Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </div>

            {/* Móvil: tarjetas */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {proyectos.map((p) => (
                <li key={p.id}>
                  <button onClick={() => navigate(`/proyectos/${p.id}`)} className="w-full space-y-2 p-4 text-left hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{p.nombre}</p>
                        <p className="text-xs text-slate-500">{p.codigo}</p>
                      </div>
                      <StatusBadge dominio="proyecto" estado={p.estado} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <TipoTEBadge codigo={p.tipoTECodigo} />
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {p.comuna}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" /> {formatNumero(p.potenciaKw, 1)} kW
                      </span>
                    </div>
                    <ProgresoDocumental compacto cargados={p.docsCargados} requeridos={p.docsRequeridos} />
                  </button>
                </li>
              ))}
            </ul>
            <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
              {proyectos.length} proyecto{proyectos.length !== 1 && 's'}
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
