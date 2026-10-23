import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { PasswordStrength } from '@/features/auth/components/PasswordStrength';
import { passwordAceptable } from '@/features/auth/utils/password';
import { authService } from '@/services/authService';
import { Alert, Button, Card, CardBody, CardFooter, CardHeader, Input, useToast } from '@/components/ui';

export function PasswordPage() {
  const usuario = useUsuario();
  const toast = useToast();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errores = {
    actual: !actual ? 'Ingresa tu contraseña actual' : undefined,
    nueva: !passwordAceptable(nueva) ? 'La nueva contraseña debe ser al menos "Buena"' : nueva === actual ? 'Debe ser distinta a la actual' : undefined,
    confirmacion: confirmacion !== nueva || !confirmacion ? 'Las contraseñas no coinciden' : undefined,
  };

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setIntentado(true);
    if (errores.actual || errores.nueva || errores.confirmacion) return;
    setGuardando(true);
    setError(null);
    try {
      await authService.cambiarPassword(usuario.id, actual, nueva);
      toast.exito('Contraseña actualizada');
      setActual('');
      setNueva('');
      setConfirmacion('');
      setIntentado(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={guardar} noValidate>
      <Card>
        <CardHeader title="Cambiar contraseña" description="Usa una contraseña segura que no utilices en otros sitios." />
        <CardBody className="max-w-md space-y-4">
          {error && <Alert tipo="error">{error}</Alert>}
          <Input label="Contraseña actual" type="password" value={actual} onChange={(e) => setActual(e.target.value)} error={intentado ? errores.actual : undefined} autoComplete="current-password" />
          <div>
            <Input label="Nueva contraseña" type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} error={intentado ? errores.nueva : undefined} autoComplete="new-password" />
            <PasswordStrength password={nueva} />
          </div>
          <Input
            label="Confirmar nueva contraseña"
            type="password"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            error={intentado ? errores.confirmacion : undefined}
            autoComplete="new-password"
          />
        </CardBody>
        <CardFooter>
          <Button type="submit" icon={KeyRound} loading={guardando}>
            Actualizar contraseña
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
