import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase, CalendarPlus, Clock, Mail, MapPin, MessageSquarePlus, MessagesSquare, Star, UserX, Video, Building2 } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { TETags } from '@/features/aprendizaje/components/TETags';
import { useAsync } from '@/hooks/useAsync';
import { useTiposTE } from '@/hooks/useTiposTE';
import { asesoriasService } from '@/services/asesoriasService';
import { chatService } from '@/services/chatService';
import { useVersion } from '@/services/eventos';
import { formatCLP, formatFecha } from '@/utils/format';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar, Badge, Button, ButtonLink, Card, CardBody, CardHeader, Cargando, EmptyState, StarRating } from '@/components/ui';
import { BannerProyecto, useProyectoContexto } from '../components/ContextoProyecto';

const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function AsesorPerfilPage() {
  const { id = '' } = useParams();
  const usuario = useUsuario();
  const navigate = useNavigate();
  const { porId } = useTiposTE();
  const ctx = useProyectoContexto();
  const version = useVersion('asesorias');
  const [abriendoChat, setAbriendoChat] = useState(false);

  const { data, loading, error } = useAsync(async () => {
    const [asesor, resenas] = await Promise.all([asesoriasService.obtenerAsesor(id), asesoriasService.resenas(id)]);
    return { asesor, resenas };
  }, [id, version]);

  if (loading && !data) return <Cargando />;
  if (error || !data) {
    return (
      <Card>
        <EmptyState icon={UserX} titulo="Asesor no encontrado" accion={<ButtonLink to="/asesorias">Volver al directorio</ButtonLink>} />
      </Card>
    );
  }

  const { asesor, resenas } = data;
  const distribucion = [5, 4, 3, 2, 1].map((n) => ({ n, total: resenas.filter((r) => Math.round(r.calificacion) === n).length }));

  const enviarMensaje = async () => {
    setAbriendoChat(true);
    const conv = await chatService.iniciar(usuario.id, asesor.id, ctx.proyecto ? `Consulta: ${ctx.proyecto.nombre}` : 'Consulta general', ctx.proyectoId || undefined);
    navigate(`/asesorias/chat/${conv.id}`);
  };

  return (
    <div>
      {ctx.proyecto && <BannerProyecto nombre={ctx.proyecto.nombre} codigo={ctx.proyecto.codigo} onQuitar={ctx.quitar} />}

      <Card className="mb-6">
        <CardBody className="flex flex-col gap-6 md:flex-row md:items-start">
          <Avatar nombre={asesor.nombre} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{asesor.nombre}</h1>
              <StatusBadge dominio="disponibilidad" estado={asesor.disponibilidad} />
            </div>
            <p className="text-slate-600">{asesor.titulo}</p>
            <div className="mt-2">
              {asesor.totalResenas > 0 ? (
                <StarRating value={asesor.calificacion} mostrarValor totalResenas={asesor.totalResenas} />
              ) : (
                <span className="text-sm text-slate-400">Sin reseñas aún</span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-slate-400" /> {asesor.aniosExperiencia} años
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-slate-400" /> {asesor.comuna}, {asesor.region}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-400" /> {asesor.email}
              </span>
              <span className="font-semibold text-slate-800">{formatCLP(asesor.tarifaHora)} / hora (referencial)</span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-56">
            {asesor.disponibilidad === 'sin_cupos' ? (
              <Button icon={CalendarPlus} className="w-full" disabled>
                Sin cupos disponibles
              </Button>
            ) : (
              <ButtonLink to={`agendar${ctx.sufijo}`} icon={CalendarPlus} className="w-full">
                Agendar reunión
              </ButtonLink>
            )}
            <ButtonLink to={`solicitar${ctx.sufijo}`} variant="secondary" icon={MessageSquarePlus} className="w-full">
              Solicitar asesoría
            </ButtonLink>
            <Button variant="outline" icon={MessagesSquare} onClick={enviarMensaje} loading={abriendoChat} className="w-full">
              Enviar mensaje
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Acerca de" />
            <CardBody className="space-y-5">
              <p className="text-sm leading-relaxed text-slate-700">{asesor.bio}</p>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Especialidades</p>
                <div className="flex flex-wrap gap-1.5">
                  {asesor.especialidades.map((e) => (
                    <Badge key={e} color="brand">
                      {e}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Experiencia en tipos TE</p>
                <div className="space-y-1.5">
                  {asesor.tiposTE.map((t) => (
                    <div key={t} className="flex items-center gap-2 text-sm text-slate-700">
                      <TETags ids={[t]} porId={porId} />
                      {porId[t]?.nombre}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Modalidades</p>
                <div className="flex gap-2">
                  {asesor.modalidades.map((m) => (
                    <Badge key={m} icon={m === 'videollamada' ? Video : Building2}>
                      {m === 'videollamada' ? 'Videollamada' : 'Presencial'}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Reseñas" description={`${resenas.length} reseña(s) de otros instaladores`} />
            {resenas.length === 0 ? (
              <EmptyState icon={Star} titulo="Aún no tiene reseñas" />
            ) : (
              <CardBody className="space-y-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="text-center sm:w-40">
                    <p className="text-4xl font-bold text-slate-900">{asesor.calificacion.toFixed(1)}</p>
                    <StarRating value={asesor.calificacion} size="sm" />
                    <p className="mt-1 text-xs text-slate-500">{asesor.totalResenas} reseñas</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {distribucion.map(({ n, total }) => (
                      <div key={n} className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="w-3">{n}</span>
                        <Star className="h-3 w-3 fill-accent-400 text-accent-400" />
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-accent-400" style={{ width: `${(total / resenas.length) * 100}%` }} />
                        </div>
                        <span className="w-4 text-right">{total}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <ul className="divide-y divide-slate-100">
                  {resenas.map((r) => (
                    <li key={r.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar nombre={r.usuarioNombre} size="sm" />
                          <span className="text-sm font-medium text-slate-900">{r.usuarioNombre}</span>
                        </div>
                        <span className="text-xs text-slate-400">{formatFecha(r.fecha)}</span>
                      </div>
                      <div className="mt-2">
                        <StarRating value={r.calificacion} size="sm" />
                      </div>
                      {r.comentario && <p className="mt-1.5 text-sm text-slate-700">{r.comentario}</p>}
                      {r.aspectos.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {r.aspectos.map((a) => (
                            <span key={a} className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] text-emerald-700">
                              ✓ {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </CardBody>
            )}
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader title="Horario de atención" />
          <CardBody>
            {asesor.horario.length === 0 ? (
              <p className="text-sm text-slate-500">Sin horario publicado.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {asesor.horario.map((b, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <span className="text-slate-600">{dias[b.diaSemana]}</span>
                    <span className="inline-flex items-center gap-1 font-medium text-slate-900">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> {b.inicio} – {b.fin}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
