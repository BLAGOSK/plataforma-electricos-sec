import { useState, type FormEvent } from 'react';
import { Eye, Mail, MapPin, Phone, Save, User } from 'lucide-react';
import { useAuth, useUsuario } from '@/features/auth/context/AuthContext';
import { authService } from '@/services/authService';
import { formatFecha } from '@/utils/format';
import { StatusBadge } from '@/components/StatusBadge';
import { VisorArchivoModal } from '@/components/VisorArchivoModal';
import { Alert, Avatar, Badge, Button, Card, CardBody, CardFooter, CardHeader, Input, useToast } from '@/components/ui';

export function PerfilPage() {
  const usuario = useUsuario();
  const { setUsuario } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    nombre: usuario.nombre,
    email: usuario.email,
    telefono: usuario.telefono ?? '',
    comuna: usuario.comuna ?? '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verCertificado, setVerCertificado] = useState(false);

  const errores = {
    nombre: form.nombre.trim().split(/\s+/).length < 2 ? 'Ingresa nombre y apellido' : undefined,
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()) ? 'Correo no válido' : undefined,
  };
  const cambiado =
    form.nombre !== usuario.nombre || form.email !== usuario.email || form.telefono !== (usuario.telefono ?? '') || form.comuna !== (usuario.comuna ?? '');

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    if (errores.nombre || errores.email) return;
    setGuardando(true);
    setError(null);
    try {
      const actualizado = await authService.actualizarPerfil(usuario.id, {
        nombre: form.nombre.trim(),
        email: form.email.trim().toLowerCase(),
        telefono: form.telefono.trim() || undefined,
        comuna: form.comuna.trim() || undefined,
      });
      setUsuario(actualizado);
      toast.exito('Perfil actualizado');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="flex flex-col items-center gap-4 sm:flex-row">
          <Avatar nombre={usuario.nombre} size="xl" />
          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold text-slate-900">{usuario.nombre}</p>
            <p className="text-sm text-slate-500">{usuario.email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge color={usuario.rol === 'admin' ? 'purple' : 'brand'}>{usuario.rol === 'admin' ? 'Administrador' : 'Instalador eléctrico'}</Badge>
              <StatusBadge dominio="usuario" estado={usuario.estado} />
            </div>
          </div>
        </CardBody>
      </Card>

      <form onSubmit={guardar} noValidate>
        <Card>
          <CardHeader title="Datos personales" />
          <CardBody className="space-y-4">
            {error && <Alert tipo="error">{error}</Alert>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nombre completo" icon={User} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} error={errores.nombre} />
              <Input label="RUT" value={usuario.rut} disabled hint="El RUT no se puede modificar" />
              <Input label="Correo electrónico" icon={Mail} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errores.email} />
              <Input label="Teléfono" icon={Phone} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+56 9 …" />
              <Input label="Comuna" icon={MapPin} value={form.comuna} onChange={(e) => setForm({ ...form, comuna: e.target.value })} />
            </div>
          </CardBody>
          <CardFooter>
            <Button type="submit" icon={Save} loading={guardando} disabled={!cambiado}>
              Guardar cambios
            </Button>
          </CardFooter>
        </Card>
      </form>

      {usuario.licencia && (
        <Card>
          <CardHeader title="Licencia SEC" description="Validada por el administrador. Para modificarla, contacta a soporte." />
          <CardBody>
            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-slate-500">Número</dt>
                <dd className="font-medium text-slate-900">{usuario.licencia.numero}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Clase</dt>
                <dd className="font-medium text-slate-900">Clase {usuario.licencia.clase}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Registrado</dt>
                <dd className="font-medium text-slate-900">{formatFecha(usuario.fechaRegistro)}</dd>
              </div>
            </dl>
            {usuario.certificado && (
              <Button variant="outline" size="sm" icon={Eye} className="mt-4" onClick={() => setVerCertificado(true)}>
                Ver certificado ({usuario.certificado.nombre})
              </Button>
            )}
          </CardBody>
        </Card>
      )}
      <VisorArchivoModal archivo={verCertificado ? (usuario.certificado ?? null) : null} titulo="Certificado SEC" onClose={() => setVerCertificado(false)} />
    </div>
  );
}
