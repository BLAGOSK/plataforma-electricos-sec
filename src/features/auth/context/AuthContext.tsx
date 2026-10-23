import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '@/services/authService';
import { useVersion } from '@/services/eventos';
import type { RegistroPayload, Usuario } from '@/types/usuario';

interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  esAdmin: boolean;
  login: (identificador: string, password: string) => Promise<Usuario>;
  logout: () => void;
  registrar: (payload: RegistroPayload) => Promise<Usuario>;
  /** Reemplaza el usuario en sesión (tras editar el perfil). */
  setUsuario: (u: Usuario) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  // Si el admin cambia el estado de la cuenta en sesión (demo en la misma pestaña), se refleja.
  const versionUsuarios = useVersion('usuarios');

  useEffect(() => {
    authService
      .sesionActual()
      .then(setUsuario)
      .finally(() => setCargando(false));
  }, [versionUsuarios]);

  const login = useCallback(async (identificador: string, password: string) => {
    const { usuario } = await authService.login(identificador, password);
    setUsuario(usuario);
    return usuario;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUsuario(null);
  }, []);

  const registrar = useCallback(async (payload: RegistroPayload) => {
    const nuevo = await authService.registrar(payload);
    setUsuario(nuevo);
    return nuevo;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ usuario, cargando, esAdmin: usuario?.rol === 'admin', login, logout, registrar, setUsuario }),
    [usuario, cargando, login, logout, registrar],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

/** Usuario en sesión garantizado (solo dentro de rutas protegidas). */
// eslint-disable-next-line react-refresh/only-export-components
export function useUsuario(): Usuario {
  const { usuario } = useAuth();
  if (!usuario) throw new Error('useUsuario requiere una sesión activa');
  return usuario;
}
