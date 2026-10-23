import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Cargando } from '@/components/ui';

/** Requiere sesión iniciada y cuenta aprobada. */
export function ProtectedRoute() {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) return <Cargando className="min-h-screen" texto="Verificando sesión…" />;
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname + location.search }} />;
  if (usuario.estado !== 'aprobado') return <Navigate to="/pendiente-validacion" replace />;
  return <Outlet />;
}

/** Solo requiere sesión (la usa la pantalla de cuenta pendiente). */
export function SessionRoute() {
  const { usuario, cargando } = useAuth();
  if (cargando) return <Cargando className="min-h-screen" />;
  if (!usuario) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/** Rutas públicas: si ya hay sesión, redirige al inicio. */
export function PublicOnlyRoute() {
  const { usuario, cargando } = useAuth();
  if (cargando) return <Cargando className="min-h-screen" />;
  if (usuario) return <Navigate to={usuario.estado === 'aprobado' ? '/' : '/pendiente-validacion'} replace />;
  return <Outlet />;
}
