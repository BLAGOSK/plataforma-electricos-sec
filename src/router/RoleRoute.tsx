import { Outlet } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ButtonLink, EmptyState } from '@/components/ui';
import type { Rol } from '@/types/usuario';

/** Restringe un grupo de rutas a ciertos roles. Se usa dentro de ProtectedRoute. */
export function RoleRoute({ roles }: { roles: Rol[] }) {
  const { usuario } = useAuth();
  if (!usuario || !roles.includes(usuario.rol)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        titulo="Acceso restringido"
        descripcion="No tienes permisos para ver esta sección. Si crees que es un error, contacta al administrador."
        accion={<ButtonLink to="/">Volver al inicio</ButtonLink>}
        className="py-24"
      />
    );
  }
  return <Outlet />;
}
