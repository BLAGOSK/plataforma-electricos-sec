import { db, guardarDb, nuevoId } from '@/mocks/db';
import { preferenciasDefecto } from '@/mocks/usuarios';
import { formatearRut, mismoRut } from '@/features/auth/utils/rut';
import type { PerfilPayload, PreferenciasNotificacion, RegistroPayload, Sesion, Usuario } from '@/types/usuario';
import { archivoDesdeFile } from './archivos';
import { emitirCambio } from './eventos';
import { setToken } from './http';
import { clonar, delay, ServiceError } from './mockDelay';

const SESION_KEY = 'sec-demo-sesion';

function usuarioPorId(id: string): Usuario {
  const u = db.usuarios.find((x) => x.id === id);
  if (!u) throw new ServiceError('Usuario no encontrado', 404);
  return u;
}

export const authService = {
  /** Ingreso con RUT o correo electrónico. */
  async login(identificador: string, password: string): Promise<Sesion> {
    await delay(400);
    const id = identificador.trim();
    const usuario = id.includes('@')
      ? db.usuarios.find((u) => u.email.toLowerCase() === id.toLowerCase())
      : db.usuarios.find((u) => mismoRut(u.rut, id));

    if (!usuario || db.credenciales[usuario.id] !== password) {
      throw new ServiceError('RUT/correo o contraseña incorrectos', 401);
    }
    const token = `mock-token-${usuario.id}-${Date.now()}`;
    localStorage.setItem(SESION_KEY, usuario.id);
    setToken(token);
    return { usuario: clonar(usuario), token };
  },

  async sesionActual(): Promise<Usuario | null> {
    await delay(100);
    const id = localStorage.getItem(SESION_KEY);
    const usuario = id ? db.usuarios.find((u) => u.id === id) : undefined;
    return usuario ? clonar(usuario) : null;
  },

  logout(): void {
    localStorage.removeItem(SESION_KEY);
    setToken(null);
  },

  /** Crea la cuenta en estado "pendiente" e inicia sesión con ella. */
  async registrar(payload: RegistroPayload): Promise<Usuario> {
    await delay(700);
    // Una cuenta rechazada puede volver a registrarse: la solicitud anterior se reemplaza.
    db.usuarios = db.usuarios.filter(
      (u) =>
        !(u.estado === 'rechazado' && (mismoRut(u.rut, payload.rut) || u.email.toLowerCase() === payload.email.toLowerCase())),
    );
    if (db.usuarios.some((u) => mismoRut(u.rut, payload.rut))) {
      throw new ServiceError('Ya existe una cuenta registrada con este RUT', 409);
    }
    if (db.usuarios.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
      throw new ServiceError('Ya existe una cuenta registrada con este correo', 409);
    }
    const usuario: Usuario = {
      id: nuevoId('u'),
      nombre: payload.nombre.trim(),
      rut: formatearRut(payload.rut),
      email: payload.email.trim().toLowerCase(),
      rol: 'electrico',
      estado: 'pendiente',
      licencia: payload.licencia,
      certificado: archivoDesdeFile(payload.certificado),
      fechaRegistro: new Date().toISOString(),
    };
    db.usuarios.push(usuario);
    db.credenciales[usuario.id] = payload.password;
    db.notificaciones.unshift({
      id: nuevoId('not'),
      usuarioId: 'u-002',
      tipo: 'alerta',
      titulo: 'Nuevo registro por validar',
      mensaje: `${usuario.nombre} se registró y espera validación de su certificado SEC.`,
      fecha: new Date().toISOString(),
      leida: false,
      enlace: `/admin/usuarios/${usuario.id}`,
    });
    guardarDb();
    emitirCambio('usuarios', 'notificaciones');
    localStorage.setItem(SESION_KEY, usuario.id);
    setToken(`mock-token-${usuario.id}`);
    return clonar(usuario);
  },

  async actualizarPerfil(usuarioId: string, datos: PerfilPayload): Promise<Usuario> {
    await delay();
    const usuario = usuarioPorId(usuarioId);
    if (db.usuarios.some((u) => u.id !== usuarioId && u.email.toLowerCase() === datos.email.toLowerCase())) {
      throw new ServiceError('El correo ya está en uso por otra cuenta', 409);
    }
    Object.assign(usuario, datos);
    guardarDb();
    emitirCambio('usuarios');
    return clonar(usuario);
  },

  async cambiarPassword(usuarioId: string, actual: string, nueva: string): Promise<void> {
    await delay(500);
    if (db.credenciales[usuarioId] !== actual) throw new ServiceError('La contraseña actual no es correcta');
    db.credenciales[usuarioId] = nueva;
    guardarDb();
  },

  async obtenerPreferencias(usuarioId: string): Promise<PreferenciasNotificacion> {
    await delay(150);
    return clonar(db.preferencias[usuarioId] ?? preferenciasDefecto);
  },

  async guardarPreferencias(usuarioId: string, prefs: PreferenciasNotificacion): Promise<void> {
    await delay();
    db.preferencias[usuarioId] = clonar(prefs);
    guardarDb();
  },
};
