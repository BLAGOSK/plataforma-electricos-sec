import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Hand,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Settings,
  Users,
  Video,
  VideoOff,
  type LucideIcon,
} from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { asesoriasService } from '@/services/asesoriasService';
import { cn } from '@/utils/cn';
import { formatFechaHora } from '@/utils/format';
import { Alert, Avatar, Button, ButtonLink, Card, Cargando, EmptyState } from '@/components/ui';

function Control({ icon: Icon, activo = true, peligro, label, onClick }: { icon: LucideIcon; activo?: boolean; peligro?: boolean; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={activo}
      className={cn(
        'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
        peligro ? 'bg-red-600 text-white hover:bg-red-700' : activo ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500/90 text-white hover:bg-red-500',
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

/** Sala de videollamada (maqueta visual, sin transmisión real). */
export function VideollamadaPage() {
  const { reunionId = '' } = useParams();
  const usuario = useUsuario();
  const navigate = useNavigate();
  const { data: reunion, loading } = useAsync(() => asesoriasService.obtenerReunion(reunionId), [reunionId]);

  const [enSala, setEnSala] = useState(false);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [compartiendo, setCompartiendo] = useState(false);
  const [panel, setPanel] = useState<'chat' | 'participantes' | null>(null);
  const [mano, setMano] = useState(false);
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    if (!enSala) return;
    const t = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [enSala]);

  if (loading) return <Cargando />;
  if (!reunion) return <EmptyState titulo="Reunión no encontrada" accion={<ButtonLink to="/asesorias/reuniones">Mis reuniones</ButtonLink>} />;
  if (reunion.modalidad !== 'videollamada') {
    return <EmptyState titulo="Esta reunión es presencial" descripcion={reunion.direccion} accion={<ButtonLink to="/asesorias/reuniones">Mis reuniones</ButtonLink>} />;
  }

  const salir = async () => {
    await asesoriasService.finalizar(reunion.id);
    navigate(`/asesorias/reuniones/${reunion.id}/calificar`);
  };

  const duracion = `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`;

  // ---- Sala de espera ----
  if (!enSala) {
    return (
      <div className="mx-auto max-w-4xl">
        <Alert tipo="info" className="mb-4">
          Maqueta de videollamada: no se accede a la cámara ni al micrófono. La transmisión real se implementará en una fase posterior.
        </Alert>
        <Card className="grid overflow-hidden md:grid-cols-[1.4fr_1fr]">
          <div className="relative flex aspect-video items-center justify-center bg-slate-900">
            {cam ? (
              <div className="flex flex-col items-center gap-3">
                <Avatar nombre={usuario.nombre} size="xl" />
                <span className="text-xs text-slate-400">Vista previa de tu cámara (simulada)</span>
              </div>
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm text-slate-400">
                <VideoOff className="h-8 w-8" /> Cámara apagada
              </span>
            )}
            <div className="absolute bottom-4 flex gap-3">
              <Control icon={mic ? Mic : MicOff} activo={mic} label={mic ? 'Silenciar' : 'Activar micrófono'} onClick={() => setMic(!mic)} />
              <Control icon={cam ? Video : VideoOff} activo={cam} label={cam ? 'Apagar cámara' : 'Encender cámara'} onClick={() => setCam(!cam)} />
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4 p-6">
            <div>
              <p className="text-sm text-slate-500">Reunión con</p>
              <p className="text-lg font-semibold text-slate-900">{reunion.asesorNombre}</p>
              <p className="mt-1 text-sm text-slate-600">{reunion.tema}</p>
              <p className="mt-1 text-xs text-slate-400">{formatFechaHora(reunion.fechaInicio)} · {reunion.duracionMin} min</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              {reunion.asesorNombre.split(' ')[0]} ya está en la sala
            </div>
            <Button size="lg" icon={Video} onClick={() => setEnSala(true)}>
              Unirse ahora
            </Button>
            <Button variant="ghost" onClick={() => navigate('/asesorias/reuniones')}>
              Volver
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ---- Sala ----
  return (
    <div className="overflow-hidden rounded-2xl bg-slate-950 text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{reunion.tema}</p>
          <p className="text-xs text-slate-400">
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-red-500" />
            {duracion} · {reunion.asesorNombre}
          </p>
        </div>
        <Settings className="h-5 w-5 text-slate-400" />
      </div>

      <div className="flex h-[calc(100vh-19rem)] min-h-[24rem]">
        <div className="relative flex flex-1 items-center justify-center p-4">
          {/* Participante principal */}
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900">
            {compartiendo ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-800 text-slate-300">
                <MonitorUp className="h-10 w-10" />
                <p className="text-sm">Estás compartiendo tu pantalla (simulado)</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-full ring-4 ring-emerald-500/60 ring-offset-4 ring-offset-slate-900">
                  <Avatar nombre={reunion.asesorNombre} size="xl" />
                </div>
                <p className="text-sm text-slate-300">{reunion.asesorNombre}</p>
              </div>
            )}
            <span className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 text-xs">{reunion.asesorNombre}</span>
          </div>
          {/* Vista propia */}
          <div className="absolute bottom-8 right-8 flex h-28 w-40 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-slate-800 shadow-xl sm:h-32 sm:w-48">
            {cam ? <Avatar nombre={usuario.nombre} size="lg" /> : <VideoOff className="h-6 w-6 text-slate-400" />}
            <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[11px]">
              {!mic && <MicOff className="h-3 w-3 text-red-400" />} Tú {mano && '✋'}
            </span>
          </div>
        </div>

        {panel && (
          <aside className="hidden w-72 flex-col border-l border-white/10 bg-slate-900 sm:flex">
            <p className="border-b border-white/10 px-4 py-3 text-sm font-semibold">{panel === 'chat' ? 'Chat de la reunión' : 'Participantes (2)'}</p>
            {panel === 'chat' ? (
              <div className="flex flex-1 flex-col justify-end gap-2 p-4 text-sm">
                <p className="rounded-lg bg-white/10 px-3 py-2">
                  <span className="block text-xs text-slate-400">{reunion.asesorNombre.split(' ')[0]}</span>Hola, ¿me escuchas bien?
                </p>
                <input disabled placeholder="Chat simulado" className="rounded-lg bg-white/5 px-3 py-2 text-sm placeholder:text-slate-500" />
              </div>
            ) : (
              <ul className="space-y-3 p-4 text-sm">
                {[reunion.asesorNombre, `${usuario.nombre} (tú)`].map((n) => (
                  <li key={n} className="flex items-center gap-2">
                    <Avatar nombre={n} size="sm" /> <span className="truncate">{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 px-4 py-4">
        <Control icon={mic ? Mic : MicOff} activo={mic} label={mic ? 'Silenciar' : 'Activar micrófono'} onClick={() => setMic(!mic)} />
        <Control icon={cam ? Video : VideoOff} activo={cam} label={cam ? 'Apagar cámara' : 'Encender cámara'} onClick={() => setCam(!cam)} />
        <Control icon={MonitorUp} activo={!compartiendo} label="Compartir pantalla" onClick={() => setCompartiendo(!compartiendo)} />
        <Control icon={Hand} activo={!mano} label="Levantar la mano" onClick={() => setMano(!mano)} />
        <Control icon={MessageSquare} label="Chat" onClick={() => setPanel(panel === 'chat' ? null : 'chat')} />
        <Control icon={Users} label="Participantes" onClick={() => setPanel(panel === 'participantes' ? null : 'participantes')} />
        <span className="mx-2 h-8 w-px bg-white/10" />
        <Control icon={PhoneOff} peligro label="Finalizar llamada" onClick={salir} />
      </div>
    </div>
  );
}
