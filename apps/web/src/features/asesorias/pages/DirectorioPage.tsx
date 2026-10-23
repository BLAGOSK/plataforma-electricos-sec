import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, CalendarPlus, MapPin, Search, UserSearch, Video, Building2 } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { useDebounce } from '@/hooks/useDebounce';
import { useTiposTE } from '@/hooks/useTiposTE';
import { asesoriasService, type FiltrosAsesores } from '@/services/asesoriasService';
import { useVersion } from '@/services/eventos';
import type { Modalidad } from '@/types/asesoria';
import { formatCLP, formatFechaHora } from '@/utils/format';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar, ButtonLink, Card, Cargando, Checkbox, EmptyState, Select, StarRating } from '@/components/ui';
import { TETags } from '@/features/aprendizaje/components/TETags';
import { AsesoriasHeader } from '../components/AsesoriasHeader';
import { BannerProyecto, useProyectoContexto } from '../components/ContextoProyecto';

export function DirectorioPage() {
  const { tipos, porId } = useTiposTE();
  const ctx = useProyectoContexto();
  const version = useVersion('asesorias');

  const [busqueda, setBusqueda] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [params] = useSearchParams();
  const [tipoTEId, setTipoTEId] = useState(params.get('te') ?? '');
  const [modalidad, setModalidad] = useState<Modalidad | ''>('');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [orden, setOrden] = useState<NonNullable<FiltrosAsesores['orden']>>('calificacion');
  const q = useDebounce(busqueda, 250);

  const { data: especialidades = [] } = useAsync(() => asesoriasService.especialidades(), [version]);
  const { data: asesores, loading } = useAsync(
    () => asesoriasService.listarAsesores({ q, especialidad, tipoTEId, modalidad: modalidad || undefined, soloDisponibles, orden }),
    [q, especialidad, tipoTEId, modalidad, soloDisponibles, orden, version],
  );

  return (
    <div>
      <AsesoriasHeader />
      {ctx.proyecto && <BannerProyecto nombre={ctx.proyecto.nombre} codigo={ctx.proyecto.codigo} onQuitar={ctx.quitar} />}

      <Card className="mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_12rem_12rem_11rem_11rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, especialidad o comuna…"
              className="form-control pl-9"
              aria-label="Buscar asesores"
            />
          </div>
          <Select value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} placeholder="Todas las especialidades" opciones={especialidades.map((e) => ({ value: e, label: e }))} aria-label="Especialidad" />
          <Select value={tipoTEId} onChange={(e) => setTipoTEId(e.target.value)} placeholder="Todos los tipos TE" opciones={tipos.map((t) => ({ value: t.id, label: `${t.codigo} — ${t.nombre}` }))} aria-label="Tipo TE" />
          <Select
            value={modalidad}
            onChange={(e) => setModalidad(e.target.value as Modalidad | '')}
            placeholder="Cualquier modalidad"
            opciones={[
              { value: 'videollamada', label: 'Videollamada' },
              { value: 'presencial', label: 'Presencial' },
            ]}
            aria-label="Modalidad"
          />
          <Select
            value={orden}
            onChange={(e) => setOrden(e.target.value as typeof orden)}
            opciones={[
              { value: 'calificacion', label: 'Mejor calificados' },
              { value: 'experiencia', label: 'Más experiencia' },
              { value: 'tarifa', label: 'Menor tarifa' },
            ]}
            aria-label="Ordenar por"
          />
        </div>
        <div className="mt-3">
          <Checkbox label="Mostrar solo asesores con cupos disponibles" checked={soloDisponibles} onChange={(e) => setSoloDisponibles(e.target.checked)} />
        </div>
      </Card>

      {loading && !asesores ? (
        <Cargando />
      ) : !asesores?.length ? (
        <Card>
          <EmptyState icon={UserSearch} titulo="No hay asesores que coincidan" descripcion="Ajusta los filtros para ver más profesionales." />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {asesores.map((a) => (
            <Card key={a.id} className="flex flex-col p-5">
              <div className="flex items-start gap-4">
                <Avatar nombre={a.nombre} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link to={`/asesorias/asesores/${a.id}${ctx.sufijo}`} className="font-semibold text-slate-900 hover:text-brand-800">
                        {a.nombre}
                      </Link>
                      <p className="text-sm text-slate-500">{a.titulo}</p>
                    </div>
                    <StatusBadge dominio="disponibilidad" estado={a.disponibilidad} />
                  </div>
                  <div className="mt-1.5">
                    {a.totalResenas > 0 ? (
                      <StarRating value={a.calificacion} size="sm" mostrarValor totalResenas={a.totalResenas} />
                    ) : (
                      <span className="text-xs text-slate-400">Sin reseñas aún</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {a.especialidades.map((e) => (
                  <span key={e} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {e}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" /> {a.aniosExperiencia} años de experiencia
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {a.comuna}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  {a.modalidades.includes('presencial') ? <Building2 className="h-3.5 w-3.5 text-slate-400" /> : <Video className="h-3.5 w-3.5 text-slate-400" />}
                  {a.modalidades.map((m) => (m === 'videollamada' ? 'Videollamada' : 'Presencial')).join(' · ')}
                </span>
                <span className="font-medium text-slate-800">{formatCLP(a.tarifaHora)} / hora</span>
              </div>

              <div className="mt-4 flex flex-1 flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Experiencia en</p>
                  <TETags ids={a.tiposTE} porId={porId} />
                  {a.proximoBloque && <p className="text-xs text-emerald-700">Próximo bloque: {formatFechaHora(a.proximoBloque)}</p>}
                </div>
                <div className="flex gap-2">
                  <ButtonLink to={`/asesorias/asesores/${a.id}${ctx.sufijo}`} variant="outline" size="sm">
                    Ver perfil
                  </ButtonLink>
                  {a.disponibilidad !== 'sin_cupos' && (
                    <ButtonLink to={`/asesorias/asesores/${a.id}/agendar${ctx.sufijo}`} size="sm" icon={CalendarPlus}>
                      Agendar
                    </ButtonLink>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
