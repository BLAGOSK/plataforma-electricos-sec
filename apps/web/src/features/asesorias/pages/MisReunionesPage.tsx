import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CalendarPlus, CalendarX2, FolderKanban, MapPin, Star, Video, XCircle } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { asesoriasService, type ReunionDetalle } from '@/services/asesoriasService';
import { useVersion } from '@/services/eventos';
import { formatHora } from '@/utils/format';
import { StatusBadge } from '@/components/StatusBadge';
import { Button, ButtonLink, Card, Cargando, EmptyState, Tabs, useToast } from '@/components/ui';
import { AsesoriasHeader } from '../components/AsesoriasHeader';

type Vista = 'proximas' | 'pasadas';

function FilaReunion({ r }: { r: ReunionDetalle }) {
  const toast = useToast();
  const fecha = new Date(r.fechaInicio);
  const ahora = Date.now();
  const inicio = fecha.getTime();
  // Se habilita "Unirse" desde 15 min antes (en la demo, siempre que sea hoy o mañana)
  const puedeUnirse = r.estado === 'agendada' && r.modalidad === 'videollamada' && inicio - ahora < 48 * 3_600_000;

  const cancelar = async () => {
    if (!confirm('¿Cancelar esta reunión?')) return;
    await asesoriasService.cancelar(r.id);
    toast.info('Reunión cancelada');
  };

  return (
    <li className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <div className="flex w-16 shrink-0 flex-col items-center rounded-lg border border-slate-200 bg-slate-50 py-2">
        <span className="text-[11px] font-semibold uppercase text-brand-700">{fecha.toLocaleDateString('es-CL', { month: 'short' })}</span>
        <span className="text-2xl font-bold leading-none text-slate-900">{fecha.getDate()}</span>
        <span className="text-[11px] text-slate-500">{fecha.toLocaleDateString('es-CL', { weekday: 'short' })}</span>
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-900">{r.tema}</p>
          <StatusBadge dominio="reunion" estado={r.estado} />
        </div>
        <p className="text-sm text-slate-600">
          con{' '}
          <Link to={`/asesorias/asesores/${r.asesorId}`} className="font-medium text-brand-700 hover:underline">
            {r.asesorNombre}
          </Link>{' '}
          · {formatHora(r.fechaInicio)} · {r.duracionMin} min
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            {r.modalidad === 'videollamada' ? <Video className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
            {r.modalidad === 'videollamada' ? 'Videollamada' : 'Presencial'}
          </span>
          {r.direccion && (
            <a href={`https://www.google.com/maps/search/${encodeURIComponent(r.direccion)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-brand-700">
              <MapPin className="h-3.5 w-3.5" /> {r.direccion}
            </a>
          )}
          {r.proyectoId && r.proyectoNombre && (
            <Link to={`/proyectos/${r.proyectoId}`} className="inline-flex items-center gap-1 hover:text-brand-700">
              <FolderKanban className="h-3.5 w-3.5" /> {r.proyectoNombre}
            </Link>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {r.estado === 'agendada' && (
          <>
            {puedeUnirse && (
              <ButtonLink to={`/asesorias/videollamada/${r.id}`} size="sm" icon={Video}>
                Unirse
              </ButtonLink>
            )}
            <Button size="sm" variant="ghost" icon={XCircle} onClick={cancelar}>
              Cancelar
            </Button>
          </>
        )}
        {r.estado === 'finalizada' &&
          (r.calificada ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
              <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" /> Calificada
            </span>
          ) : (
            <ButtonLink to={`/asesorias/reuniones/${r.id}/calificar`} size="sm" variant="secondary" icon={Star}>
              Calificar asesoría
            </ButtonLink>
          ))}
      </div>
    </li>
  );
}

export function MisReunionesPage() {
  const usuario = useUsuario();
  const version = useVersion('asesorias');
  const [vista, setVista] = useState<Vista>('proximas');
  const { data: reuniones, loading } = useAsync(() => asesoriasService.listarReuniones(usuario.id), [usuario.id, version]);

  const proximas = reuniones?.filter((r) => r.estado === 'agendada') ?? [];
  const pasadas = [...(reuniones?.filter((r) => r.estado !== 'agendada') ?? [])].reverse();
  const lista = vista === 'proximas' ? proximas : pasadas;
  const sinCalificar = pasadas.filter((r) => r.estado === 'finalizada' && !r.calificada).length;

  return (
    <div>
      <AsesoriasHeader acciones={<ButtonLink to="/asesorias" icon={CalendarPlus}>Agendar con un asesor</ButtonLink>} />
      <Card>
        <div className="px-4 pt-3">
          <Tabs
            value={vista}
            onChange={setVista}
            items={[
              { value: 'proximas', label: 'Próximas', extra: <span className="rounded-full bg-slate-100 px-1.5 text-xs">{proximas.length}</span> },
              {
                value: 'pasadas',
                label: 'Historial',
                extra: sinCalificar > 0 ? <span className="rounded-full bg-amber-100 px-1.5 text-xs text-amber-800">{sinCalificar} por calificar</span> : undefined,
              },
            ]}
          />
        </div>
        {loading && !reuniones ? (
          <Cargando />
        ) : lista.length === 0 ? (
          <EmptyState
            icon={CalendarX2}
            titulo={vista === 'proximas' ? 'No tienes reuniones agendadas' : 'Aún no tienes historial'}
            descripcion="Busca un asesor en el directorio y agenda una reunión."
            accion={<ButtonLink to="/asesorias" variant="outline">Ver asesores</ButtonLink>}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {lista.map((r) => (
              <FilaReunion key={r.id} r={r} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
