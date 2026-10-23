import { Navigate, useNavigate } from 'react-router-dom';
import { Ban, CheckCircle2, Clock, FileCheck2, LogOut, Mail, UserPlus, XCircle, type LucideIcon } from 'lucide-react';
import { Alert, Button, ButtonLink, buttonClasses, Card, CardBody } from '@/components/ui';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/utils/cn';
import { formatFecha, formatFechaHora } from '@/utils/format';
import { useAuth, useUsuario } from '../context/AuthContext';

interface Paso {
  titulo: string;
  descripcion: string;
  icon: LucideIcon;
  estado: 'hecho' | 'actual' | 'pendiente' | 'error';
}

export function PendienteValidacionPage() {
  const usuario = useUsuario();
  const { logout } = useAuth();
  const navigate = useNavigate();

  if (usuario.estado === 'aprobado') return <Navigate to="/" replace />;

  const salir = () => {
    logout();
    navigate('/login');
  };

  const pasos: Paso[] = [
    { titulo: 'Registro recibido', descripcion: formatFechaHora(usuario.fechaRegistro), icon: UserPlus, estado: 'hecho' },
    {
      titulo: 'Revisión del certificado SEC',
      descripcion: usuario.estado === 'pendiente' ? 'Un administrador está validando tu licencia' : 'Revisión finalizada',
      icon: FileCheck2,
      estado: usuario.estado === 'pendiente' ? 'actual' : 'hecho',
    },
    {
      titulo: usuario.estado === 'rechazado' ? 'Solicitud rechazada' : usuario.estado === 'suspendido' ? 'Cuenta suspendida' : 'Cuenta habilitada',
      descripcion:
        usuario.estado === 'pendiente'
          ? 'Recibirás un correo cuando tu cuenta sea aprobada'
          : usuario.fechaEstado
            ? formatFecha(usuario.fechaEstado)
            : '',
      icon: usuario.estado === 'pendiente' ? CheckCircle2 : usuario.estado === 'rechazado' ? XCircle : Ban,
      estado: usuario.estado === 'pendiente' ? 'pendiente' : 'error',
    },
  ];

  const encabezado = {
    pendiente: {
      icon: Clock,
      color: 'bg-amber-100 text-amber-600',
      titulo: 'Tu cuenta está pendiente de validación',
      texto: 'Gracias por registrarte. Revisaremos tu certificado SEC y te avisaremos por correo cuando tu cuenta esté habilitada. Normalmente toma entre 24 y 48 horas hábiles.',
    },
    rechazado: {
      icon: XCircle,
      color: 'bg-red-100 text-red-600',
      titulo: 'Tu solicitud de registro fue rechazada',
      texto: 'Revisa el motivo indicado por el administrador. Puedes volver a registrarte corrigiendo la información.',
    },
    suspendido: {
      icon: Ban,
      color: 'bg-slate-200 text-slate-600',
      titulo: 'Tu cuenta se encuentra suspendida',
      texto: 'No puedes acceder a la plataforma mientras la suspensión esté vigente. Contacta a soporte para más información.',
    },
  }[usuario.estado];

  const Icon = encabezado.icon;

  return (
    <div>
      <div className={cn('mb-5 inline-flex rounded-full p-3', encabezado.color)}>
        <Icon className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{encabezado.titulo}</h1>
      <p className="mt-2 text-sm text-slate-600">{encabezado.texto}</p>

      {usuario.motivoEstado && usuario.estado !== 'pendiente' && (
        <Alert tipo={usuario.estado === 'rechazado' ? 'error' : 'alerta'} titulo="Motivo" className="mt-5">
          {usuario.motivoEstado}
        </Alert>
      )}

      <Card className="mt-6">
        <CardBody>
          <ol className="space-y-5">
            {pasos.map((p, i) => {
              const PasoIcon = p.icon;
              return (
                <li key={p.titulo} className="relative flex gap-4">
                  {i < pasos.length - 1 && <span className="absolute left-4 top-9 h-[calc(100%-4px)] w-px bg-slate-200" />}
                  <span
                    className={cn(
                      'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      p.estado === 'hecho' && 'bg-emerald-100 text-emerald-600',
                      p.estado === 'actual' && 'bg-amber-100 text-amber-600 ring-4 ring-amber-50',
                      p.estado === 'pendiente' && 'bg-slate-100 text-slate-400',
                      p.estado === 'error' && 'bg-red-100 text-red-600',
                    )}
                  >
                    <PasoIcon className="h-4 w-4" />
                  </span>
                  <div className="pt-1">
                    <p className="text-sm font-semibold text-slate-900">{p.titulo}</p>
                    <p className="text-xs text-slate-500">{p.descripcion}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardBody className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">Datos enviados</span>
            <StatusBadge dominio="usuario" estado={usuario.estado} />
          </div>
          <dl className="grid grid-cols-[8rem_1fr] gap-y-1.5 text-slate-600">
            <dt className="text-slate-500">Nombre</dt>
            <dd>{usuario.nombre}</dd>
            <dt className="text-slate-500">RUT</dt>
            <dd>{usuario.rut}</dd>
            <dt className="text-slate-500">Correo</dt>
            <dd className="truncate">{usuario.email}</dd>
            <dt className="text-slate-500">Licencia SEC</dt>
            <dd>
              {usuario.licencia?.numero} · Clase {usuario.licencia?.clase}
            </dd>
            <dt className="text-slate-500">Certificado</dt>
            <dd className="truncate">{usuario.certificado?.nombre}</dd>
          </dl>
        </CardBody>
      </Card>

      {usuario.estado === 'pendiente' && (
        <Alert tipo="info" className="mt-4" titulo="Demo">
          Para aprobar esta cuenta, cierra sesión e ingresa como <strong>Administrador</strong>; luego ve a
          Administración → Usuarios.
        </Alert>
      )}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" icon={LogOut} onClick={salir} className="flex-1">
          Cerrar sesión
        </Button>
        {usuario.estado === 'rechazado' ? (
          <ButtonLink to="/registro" icon={UserPlus} className="flex-1" onClick={() => logout()}>
            Registrarme nuevamente
          </ButtonLink>
        ) : (
          <a href="mailto:soporte@electricos-sec.cl" className={buttonClasses('secondary', 'md', 'flex-1')}>
            <Mail className="h-4 w-4" />
            Contactar a soporte
          </a>
        )}
      </div>
    </div>
  );
}
