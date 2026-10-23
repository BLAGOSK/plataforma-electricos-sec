import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, CalendarCheck, CalendarX, Clock, MapPin, Video } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { asesoriasService } from '@/services/asesoriasService';
import type { Modalidad } from '@/types/asesoria';
import { cn } from '@/utils/cn';
import { formatFechaLarga, formatHora } from '@/utils/format';
import { PageHeader } from '@/components/PageHeader';
import { Alert, Avatar, Button, Card, CardBody, CardHeader, Cargando, EmptyState, Field, Input, Segmented, useToast } from '@/components/ui';
import { CalendarioDisponibilidad } from '../components/CalendarioDisponibilidad';
import { useProyectoContexto } from '../components/ContextoProyecto';
import { SelectorProyecto } from '../components/SelectorProyecto';

export function AgendarPage() {
  const { id = '' } = useParams();
  const usuario = useUsuario();
  const navigate = useNavigate();
  const toast = useToast();
  const ctx = useProyectoContexto();

  const { data, loading } = useAsync(async () => {
    const [asesor, dias] = await Promise.all([asesoriasService.obtenerAsesor(id), asesoriasService.disponibilidad(id)]);
    return { asesor, dias };
  }, [id]);

  const [fecha, setFecha] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [modalidad, setModalidad] = useState<Modalidad>('videollamada');
  const [direccion, setDireccion] = useState('');
  const [tema, setTema] = useState('');
  const [proyectoId, setProyectoId] = useState(ctx.proyectoId);
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading || !data) return <Cargando />;
  const { asesor, dias } = data;

  if (asesor.horario.length === 0 || dias.every((d) => d.slots.every((s) => !s.disponible))) {
    return (
      <Card>
        <EmptyState
          icon={CalendarX}
          titulo="Sin bloques disponibles"
          descripcion={`${asesor.nombre} no tiene horarios disponibles en las próximas semanas. Puedes enviarle un mensaje para coordinar.`}
          accion={<Button onClick={() => navigate(-1)}>Volver</Button>}
        />
      </Card>
    );
  }

  const diaSel = dias.find((d) => d.fecha === fecha);
  const errores = {
    slot: !slot ? 'Selecciona un día y un horario' : undefined,
    tema: tema.trim().length < 5 ? 'Indica el tema de la reunión' : undefined,
    direccion: modalidad === 'presencial' && !direccion.trim() ? 'Indica la dirección de la reunión' : undefined,
  };

  const confirmar = async () => {
    setIntentado(true);
    if (errores.slot || errores.tema || errores.direccion) return;
    setGuardando(true);
    setError(null);
    try {
      await asesoriasService.agendar(usuario.id, {
        asesorId: asesor.id,
        proyectoId: proyectoId || undefined,
        tema,
        fechaInicio: slot!,
        modalidad,
        direccion,
      });
      toast.exito('Reunión agendada', `${formatFechaLarga(slot!)} a las ${formatHora(slot!)}`);
      navigate('/asesorias/reuniones');
    } catch (e) {
      setError((e as Error).message);
      setGuardando(false);
    }
  };

  return (
    <div>
      <PageHeader titulo="Agendar reunión" descripcion="Elige un bloque disponible en el calendario del asesor." />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="1. Fecha y hora" description="Bloques de 60 minutos" />
            <CardBody className="grid gap-6 md:grid-cols-2">
              <CalendarioDisponibilidad
                dias={dias}
                seleccionado={fecha}
                onSeleccionar={(f) => {
                  setFecha(f);
                  setSlot(null);
                }}
              />
              <div>
                {!diaSel ? (
                  <div className="flex h-full min-h-40 items-center justify-center rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                    Selecciona un día destacado en el calendario para ver los horarios.
                  </div>
                ) : (
                  <>
                    <p className="mb-3 text-sm font-medium capitalize text-slate-900">{formatFechaLarga(diaSel.slots[0]!.inicio)}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {diaSel.slots.map((s) => (
                        <button
                          key={s.inicio}
                          type="button"
                          disabled={!s.disponible}
                          onClick={() => setSlot(s.inicio)}
                          className={cn(
                            'rounded-lg border px-2 py-2 text-sm font-medium transition-colors',
                            slot === s.inicio
                              ? 'border-brand-700 bg-brand-700 text-white'
                              : s.disponible
                                ? 'border-slate-200 text-slate-700 hover:border-brand-400 hover:bg-brand-50'
                                : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through',
                          )}
                        >
                          {formatHora(s.inicio)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {intentado && errores.slot && <p className="mt-2 text-xs text-red-600">{errores.slot}</p>}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="2. Detalles de la reunión" />
            <CardBody className="space-y-4">
              {error && <Alert tipo="error">{error}</Alert>}
              <Field id="modalidad" label="Modalidad">
                <Segmented
                  value={modalidad}
                  onChange={setModalidad}
                  items={asesor.modalidades.map((m) => ({ value: m, label: m === 'videollamada' ? 'Videollamada' : 'Reunión presencial', icon: m === 'videollamada' ? Video : Building2 }))}
                />
              </Field>
              {modalidad === 'presencial' && (
                <Input
                  label="Dirección de la reunión"
                  icon={MapPin}
                  required
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  error={intentado ? errores.direccion : undefined}
                  placeholder="Ej: dirección de la obra o de la oficina"
                />
              )}
              <Input label="Tema" required value={tema} onChange={(e) => setTema(e.target.value)} error={intentado ? errores.tema : undefined} placeholder="Ej: Revisión de planos antes de declarar" />
              <SelectorProyecto value={proyectoId} onChange={setProyectoId} />
            </CardBody>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader title="Resumen" />
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar nombre={asesor.nombre} />
              <div>
                <p className="text-sm font-semibold text-slate-900">{asesor.nombre}</p>
                <p className="text-xs text-slate-500">{asesor.titulo}</p>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CalendarCheck className="mt-0.5 h-4 w-4 text-slate-400" />
                <dd className="capitalize text-slate-700">{slot ? formatFechaLarga(slot) : <span className="normal-case text-slate-400">Sin fecha seleccionada</span>}</dd>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-slate-400" />
                <dd className="text-slate-700">{slot ? `${formatHora(slot)} · 60 min` : '—'}</dd>
              </div>
              <div className="flex items-start gap-2">
                {modalidad === 'videollamada' ? <Video className="mt-0.5 h-4 w-4 text-slate-400" /> : <Building2 className="mt-0.5 h-4 w-4 text-slate-400" />}
                <dd className="text-slate-700">{modalidad === 'videollamada' ? 'Videollamada en la plataforma' : direccion || 'Presencial (dirección pendiente)'}</dd>
              </div>
            </dl>
            <Button className="w-full" icon={CalendarCheck} onClick={confirmar} loading={guardando}>
              Confirmar reunión
            </Button>
            <p className="text-xs text-slate-500">Recibirás una notificación de confirmación. Puedes cancelar desde «Mis reuniones».</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
