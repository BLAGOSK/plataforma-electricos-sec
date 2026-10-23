import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, IdCard, Mail, User, UserPlus } from 'lucide-react';
import { Alert, Button, Checkbox, Input, Select } from '@/components/ui';
import { FileDropzone } from '@/components/FileDropzone';
import { ArchivoItem, FilePreview } from '@/components/FilePreview';
import type { ClaseLicencia } from '@/types/usuario';
import { useAuth } from '../context/AuthContext';
import { PasswordStrength } from '../components/PasswordStrength';
import { passwordAceptable } from '../utils/password';
import { errorRut, formatearRut } from '../utils/rut';

const clasesLicencia: Array<{ value: ClaseLicencia; label: string }> = [
  { value: 'A', label: 'Clase A' },
  { value: 'B', label: 'Clase B' },
  { value: 'C', label: 'Clase C' },
  { value: 'D', label: 'Clase D' },
];

interface Formulario {
  nombre: string;
  rut: string;
  email: string;
  password: string;
  confirmacion: string;
  numeroLicencia: string;
  claseLicencia: ClaseLicencia | '';
  acepta: boolean;
}

type Errores = Partial<Record<keyof Formulario | 'certificado', string>>;

const vacio: Formulario = {
  nombre: '',
  rut: '',
  email: '',
  password: '',
  confirmacion: '',
  numeroLicencia: '',
  claseLicencia: '',
  acepta: false,
};

function validar(f: Formulario, certificado: File | null): Errores {
  const e: Errores = {};
  if (f.nombre.trim().split(/\s+/).length < 2) e.nombre = 'Ingresa tu nombre y al menos un apellido';
  const errRut = errorRut(f.rut);
  if (errRut) e.rut = errRut;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Ingresa un correo válido';
  if (!passwordAceptable(f.password)) e.password = 'La contraseña debe ser al menos "Buena"';
  if (f.confirmacion !== f.password || !f.confirmacion) e.confirmacion = 'Las contraseñas no coinciden';
  if (!f.numeroLicencia.trim()) e.numeroLicencia = 'Ingresa el número de tu licencia SEC';
  if (!f.claseLicencia) e.claseLicencia = 'Selecciona la clase';
  if (!certificado) e.certificado = 'Adjunta tu certificado SEC (PDF o imagen)';
  if (!f.acepta) e.acepta = 'Debes aceptar los términos para continuar';
  return e;
}

export function RegistroPage() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Formulario>(vacio);
  const [certificado, setCertificado] = useState<File | null>(null);
  const [tocados, setTocados] = useState<Partial<Record<keyof Errores, boolean>>>({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const errores = useMemo(() => validar(form, certificado), [form, certificado]);
  const mostrar = (campo: keyof Errores) => ((intentoEnvio || tocados[campo]) ? errores[campo] : undefined);

  const previewUrl = useMemo(() => (certificado ? URL.createObjectURL(certificado) : null), [certificado]);
  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl]);

  const set = <K extends keyof Formulario>(campo: K, valor: Formulario[K]) => setForm((f) => ({ ...f, [campo]: valor }));
  const tocar = (campo: keyof Errores) => () => setTocados((t) => ({ ...t, [campo]: true }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIntentoEnvio(true);
    if (Object.keys(errores).length > 0) return;
    setEnviando(true);
    setErrorServidor(null);
    try {
      await registrar({
        nombre: form.nombre,
        rut: form.rut,
        email: form.email,
        password: form.password,
        licencia: { numero: form.numeroLicencia.trim().toUpperCase(), clase: form.claseLicencia as ClaseLicencia },
        certificado: certificado!,
      });
      navigate('/pendiente-validacion', { replace: true });
    } catch (err) {
      setErrorServidor((err as Error).message);
      setEnviando(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Crear cuenta de instalador</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tu cuenta será revisada por un administrador, quien validará tu certificado SEC antes de habilitar el acceso.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-6" noValidate>
        {errorServidor && <Alert tipo="error">{errorServidor}</Alert>}
        {intentoEnvio && Object.keys(errores).length > 0 && (
          <Alert tipo="alerta">Revisa los campos marcados antes de continuar.</Alert>
        )}

        <fieldset className="space-y-4">
          <legend className="mb-3 text-sm font-semibold text-slate-900">Datos personales</legend>
          <Input
            label="Nombre completo"
            icon={User}
            required
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            onBlur={tocar('nombre')}
            error={mostrar('nombre')}
            autoComplete="name"
            placeholder="Ej: Juan Pérez Soto"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="RUT"
              icon={IdCard}
              required
              value={form.rut}
              onChange={(e) => set('rut', e.target.value)}
              onBlur={() => {
                tocar('rut')();
                if (!errorRut(form.rut)) set('rut', formatearRut(form.rut));
              }}
              error={mostrar('rut')}
              placeholder="12.345.678-5"
              hint="Con dígito verificador"
              inputMode="text"
            />
            <Input
              label="Correo electrónico"
              icon={Mail}
              type="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              onBlur={tocar('email')}
              error={mostrar('email')}
              autoComplete="email"
              placeholder="nombre@correo.cl"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-3 text-sm font-semibold text-slate-900">Contraseña</legend>
          <div>
            <Input
              label="Contraseña"
              type="password"
              required
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              onBlur={tocar('password')}
              error={mostrar('password')}
              autoComplete="new-password"
            />
            <PasswordStrength password={form.password} />
          </div>
          <Input
            label="Confirmar contraseña"
            type="password"
            required
            value={form.confirmacion}
            onChange={(e) => set('confirmacion', e.target.value)}
            onBlur={tocar('confirmacion')}
            error={mostrar('confirmacion')}
            autoComplete="new-password"
          />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-3 text-sm font-semibold text-slate-900">Licencia SEC</legend>
          <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
            <Input
              label="Número de licencia"
              icon={BadgeCheck}
              required
              value={form.numeroLicencia}
              onChange={(e) => set('numeroLicencia', e.target.value)}
              onBlur={tocar('numeroLicencia')}
              error={mostrar('numeroLicencia')}
              placeholder="Ej: SEC-B-104552"
            />
            <Select
              label="Clase"
              required
              placeholder="Selecciona…"
              opciones={clasesLicencia}
              value={form.claseLicencia}
              onChange={(e) => set('claseLicencia', e.target.value as ClaseLicencia)}
              onBlur={tocar('claseLicencia')}
              error={mostrar('claseLicencia')}
            />
          </div>

          <div>
            <p className="label">
              Certificado SEC<span className="ml-0.5 text-red-500">*</span>
            </p>
            {certificado ? (
              <div className="space-y-3">
                <ArchivoItem
                  archivo={{ nombre: certificado.name, tipoMime: certificado.type, tamano: certificado.size }}
                  miniatura={previewUrl ?? undefined}
                  onQuitar={() => setCertificado(null)}
                />
                {previewUrl && (
                  <FilePreview
                    archivo={{ id: 'preview', nombre: certificado.name, tipoMime: certificado.type, tamano: certificado.size, url: previewUrl }}
                    className="h-72"
                  />
                )}
              </div>
            ) : (
              <FileDropzone
                accept="application/pdf,image/jpeg,image/png"
                formatos="PDF, JPG o PNG"
                maxMB={5}
                compacto
                onArchivos={([f]) => setCertificado(f ?? null)}
                error={mostrar('certificado')}
              />
            )}
          </div>
        </fieldset>

        <div>
          <Checkbox
            checked={form.acepta}
            onChange={(e) => set('acepta', e.target.checked)}
            label="Acepto los términos de uso y la política de privacidad"
            descripcion="Autorizo la verificación de mi licencia ante la SEC."
          />
          {mostrar('acepta') && <p className="mt-1.5 text-xs text-red-600">{errores.acepta}</p>}
        </div>

        <Button type="submit" size="lg" className="w-full" icon={UserPlus} loading={enviando}>
          Enviar solicitud de registro
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
