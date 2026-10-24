import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HardHat, LogIn, Mail, ShieldCheck, Hourglass } from 'lucide-react';
import { Alert, Button, Input } from '@/components/ui';
import { PASSWORD_DEMO, usuariosDemo } from '@/mocks/usuarios';
import { cn } from '@/utils/cn';
import { useAuth } from '../context/AuthContext';

const iconosDemo = [HardHat, ShieldCheck, Hourglass];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const desde = (location.state as { desde?: string } | null)?.desde;

  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!identificador.trim() || !password) {
      setError('Ingresa tu RUT o correo y tu contraseña.');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const usuario = await login(identificador, password);
      navigate(usuario.estado === 'aprobado' ? (desde ?? '/') : '/pendiente-validacion', { replace: true });
    } catch (err) {
      setError((err as Error).message);
      setEnviando(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-slate-500">Ingresa con tu RUT o correo electrónico.</p>

      {/* Selector de rol de la demo */}
      <div className="mt-6 rounded-xl border border-dashed border-brand-200 bg-brand-50/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-800">Acceso rápido de demostración</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {usuariosDemo.map((u, i) => {
            const Icon = iconosDemo[i]!;
            const seleccionado = identificador === u.email;
            return (
              <button
                key={u.email}
                type="button"
                onClick={() => {
                  setIdentificador(u.email);
                  setPassword(PASSWORD_DEMO);
                  setError(null);
                }}
                className={cn(
                  'flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-left transition-colors sm:flex-col sm:items-start',
                  seleccionado ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200 hover:border-brand-300',
                )}
              >
                <Icon className="h-4 w-4 shrink-0 text-brand-700" />
                <span>
                  <span className="block text-sm font-medium text-slate-800">{u.etiqueta}</span>
                  <span className="block text-xs text-slate-500">{u.descripcion}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        {error && <Alert tipo="error">{error}</Alert>}
        <Input
          label="RUT o correo electrónico"
          icon={Mail}
          value={identificador}
          onChange={(e) => setIdentificador(e.target.value)}
          placeholder="12.345.678-5 o nombre@correo.cl"
          autoComplete="username"
          autoFocus
        />
        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setError('Recuperación de contraseña disponible próximamente (requiere envío de correo).')}
            className="text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <Button type="submit" className="w-full" size="lg" icon={LogIn} loading={enviando}>
          Ingresar
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        ¿Eres instalador y aún no tienes cuenta?{' '}
        <Link to="/registro" className="font-semibold text-brand-700 hover:text-brand-800">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
