import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, CheckCircle2, Download, ExternalLink, RotateCcw, UserX, XCircle } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { adminService } from '@/services/adminService';
import { descargarArchivo } from '@/services/archivos';
import { useVersion } from '@/services/eventos';
import type { EstadoUsuario } from '@/types/usuario';
import { formatFechaHora } from '@/utils/format';
import { FilePreview } from '@/components/FilePreview';
import { StatusBadge } from '@/components/StatusBadge';
import { Alert, Avatar, Badge, Button, ButtonLink, Card, CardBody, CardHeader, Cargando, EmptyState, Modal, Textarea, useToast } from '@/components/ui';

type Accion = { estado: EstadoUsuario; titulo: string; requiereMotivo: boolean } | null;

export function UsuarioDetallePage() {
  const { id = '' } = useParams();
  const toast = useToast();
  const version = useVersion('usuarios');
  const { data: u, loading, error } = useAsync(() => adminService.obtenerUsuario(id), [id, version]);
  const [accion, setAccion] = useState<Accion>(null);
  const [motivo, setMotivo] = useState('');
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  if (loading && !u) return <Cargando />;
  if (error || !u) return <EmptyState icon={UserX} titulo="Usuario no encontrado" accion={<ButtonLink to="/admin/usuarios">Volver</ButtonLink>} />;

  const abrir = (a: NonNullable<Accion>) => {
    setAccion(a);
    setMotivo('');
    setIntentado(false);
    setErrorAccion(null);
  };

  const ejecutar = async (a: NonNullable<Accion>, m?: string) => {
    setIntentado(true);
    if (a.requiereMotivo && !m?.trim()) return;
    setGuardando(true);
    setErrorAccion(null);
    try {
      await adminService.cambiarEstadoUsuario(u.id, a.estado, m);
      toast.exito(
        a.estado === 'aprobado' ? 'Usuario aprobado' : a.estado === 'rechazado' ? 'Registro rechazado' : 'Usuario suspendido',
        u.nombre,
      );
      setAccion(null);
    } catch (e) {
      if (a.requiereMotivo) setErrorAccion((e as Error).message);
      else toast.error('No se pudo completar la acción', (e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const esAdmin = u.rol === 'admin';

  return (
    <div>
      <Link to="/admin/usuarios" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Usuarios
      </Link>

      <Card className="mb-6">
        <CardBody className="flex flex-col gap-5 md:flex-row md:items-center">
          <Avatar nombre={u.nombre} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{u.nombre}</h1>
              <StatusBadge dominio="usuario" estado={u.estado} />
              {esAdmin && <Badge color="purple">Administrador</Badge>}
            </div>
            <p className="text-sm text-slate-500">
              {u.rut} · {u.email}
            </p>
            <p className="mt-1 text-xs text-slate-400">Registrado el {formatFechaHora(u.fechaRegistro)}</p>
          </div>
          {!esAdmin && (
            <div className="flex flex-wrap gap-2">
              {u.estado !== 'aprobado' && (
                <Button variant="success" icon={u.estado === 'pendiente' ? CheckCircle2 : RotateCcw} onClick={() => ejecutar({ estado: 'aprobado', titulo: 'Aprobar', requiereMotivo: false })} loading={guardando && !accion}>
                  {u.estado === 'pendiente' ? 'Aprobar' : 'Reactivar / aprobar'}
                </Button>
              )}
              {u.estado === 'pendiente' && (
                <Button variant="danger" icon={XCircle} onClick={() => abrir({ estado: 'rechazado', titulo: 'Rechazar registro', requiereMotivo: true })}>
                  Rechazar
                </Button>
              )}
              {u.estado === 'aprobado' && (
                <Button variant="outline" icon={Ban} onClick={() => abrir({ estado: 'suspendido', titulo: 'Suspender usuario', requiereMotivo: true })}>
                  Suspender
                </Button>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {u.motivoEstado && (
        <Alert tipo={u.estado === 'rechazado' ? 'error' : 'alerta'} className="mb-6" titulo={`Motivo (${u.fechaEstado ? formatFechaHora(u.fechaEstado) : ''})`}>
          {u.motivoEstado}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <Card className="h-fit">
          <CardHeader title="Datos de registro" />
          <CardBody>
            <dl className="space-y-3 text-sm">
              {[
                ['Nombre', u.nombre],
                ['RUT', u.rut],
                ['Correo', u.email],
                ['Teléfono', u.telefono],
                ['Comuna', u.comuna],
                ['N° licencia SEC', u.licencia?.numero],
                ['Clase', u.licencia && `Clase ${u.licencia.clase}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-slate-500">{k}</dt>
                  <dd className="break-words text-slate-900">{v || '—'}</dd>
                </div>
              ))}
            </dl>
            <a
              href="https://www.sec.cl"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              Verificar en registro SEC <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Certificado SEC"
            description={u.certificado?.nombre}
            actions={
              u.certificado && (
                <Button size="sm" variant="outline" icon={Download} onClick={() => descargarArchivo(u.certificado!)}>
                  Descargar
                </Button>
              )
            }
          />
          <CardBody>{u.certificado ? <FilePreview archivo={u.certificado} /> : <p className="text-sm text-slate-500">Sin certificado adjunto.</p>}</CardBody>
        </Card>
      </div>

      <Modal
        abierto={!!accion}
        onClose={() => setAccion(null)}
        titulo={accion?.titulo ?? ''}
        descripcion={u.nombre}
        footer={
          <>
            <Button variant="outline" onClick={() => setAccion(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => accion && ejecutar(accion, motivo)} loading={guardando}>
              Confirmar
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {errorAccion && <Alert tipo="error">{errorAccion}</Alert>}
          <Textarea
            label="Motivo"
            required
            rows={4}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            error={intentado && !motivo.trim() ? 'El motivo es obligatorio' : undefined}
            hint="El usuario verá este motivo al iniciar sesión."
            placeholder={accion?.estado === 'rechazado' ? 'Ej: El certificado adjunto no es legible.' : 'Ej: Licencia vencida según registro público.'}
          />
        </div>
      </Modal>
    </div>
  );
}
