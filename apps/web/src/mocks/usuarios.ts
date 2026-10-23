import type { PreferenciasNotificacion, Usuario } from '@/types/usuario';

/** Contraseña de todos los usuarios demo. */
export const PASSWORD_DEMO = 'demo1234';

export const usuariosSeed: Usuario[] = [
  {
    id: 'u-001',
    nombre: 'Juan Pérez Soto',
    rut: '12.345.678-5',
    email: 'electrico@demo.cl',
    telefono: '+56 9 8765 4321',
    comuna: 'Providencia',
    rol: 'electrico',
    estado: 'aprobado',
    licencia: { numero: 'SEC-B-104552', clase: 'B' },
    certificado: {
      id: 'arc-cert-001',
      nombre: 'certificado-sec-juan-perez.pdf',
      tipoMime: 'application/pdf',
      tamano: 182_340,
      url: '/mock-files/certificado-sec-ejemplo.pdf',
    },
    fechaRegistro: '2026-03-14T12:30:00.000Z',
    fechaEstado: '2026-03-15T15:10:00.000Z',
  },
  {
    id: 'u-002',
    nombre: 'María González Rivas',
    rut: '11.111.111-1',
    email: 'admin@demo.cl',
    telefono: '+56 2 2345 6789',
    comuna: 'Santiago',
    rol: 'admin',
    estado: 'aprobado',
    fechaRegistro: '2026-01-05T09:00:00.000Z',
  },
  {
    id: 'u-003',
    nombre: 'Pedro Rojas Díaz',
    rut: '15.678.901-1',
    email: 'pendiente@demo.cl',
    comuna: 'Maipú',
    rol: 'electrico',
    estado: 'pendiente',
    licencia: { numero: 'SEC-C-220981', clase: 'C' },
    certificado: {
      id: 'arc-cert-003',
      nombre: 'licencia-sec-pedro-rojas.pdf',
      tipoMime: 'application/pdf',
      tamano: 240_118,
      url: '/mock-files/certificado-sec-ejemplo.pdf',
    },
    fechaRegistro: '2026-10-21T18:45:00.000Z',
  },
  {
    id: 'u-004',
    nombre: 'Carolina Muñoz Vera',
    rut: '16.234.567-2',
    email: 'carolina.munoz@demo.cl',
    telefono: '+56 9 7654 3210',
    comuna: 'Ñuñoa',
    rol: 'electrico',
    estado: 'aprobado',
    licencia: { numero: 'SEC-A-088120', clase: 'A' },
    certificado: {
      id: 'arc-cert-004',
      nombre: 'certificado-carolina.png',
      tipoMime: 'image/png',
      tamano: 412_009,
      url: '/mock-files/certificado-sec-ejemplo.svg',
    },
    fechaRegistro: '2026-05-02T14:00:00.000Z',
    fechaEstado: '2026-05-03T10:20:00.000Z',
  },
  {
    id: 'u-005',
    nombre: 'Diego Fuentes Lagos',
    rut: '17.890.123-0',
    email: 'diego.fuentes@demo.cl',
    comuna: 'La Florida',
    rol: 'electrico',
    estado: 'rechazado',
    licencia: { numero: 'SEC-D-33012', clase: 'D' },
    certificado: {
      id: 'arc-cert-005',
      nombre: 'certificado-borroso.jpg',
      tipoMime: 'image/jpeg',
      tamano: 98_221,
      url: '/mock-files/certificado-sec-ejemplo.svg',
    },
    fechaRegistro: '2026-09-10T11:00:00.000Z',
    fechaEstado: '2026-09-12T16:30:00.000Z',
    motivoEstado: 'El certificado adjunto no es legible. Por favor, vuelve a registrarte con una copia nítida.',
  },
  {
    id: 'u-006',
    nombre: 'Valentina Castro Pino',
    rut: '13.579.246-2',
    email: 'valentina.castro@demo.cl',
    comuna: 'Viña del Mar',
    rol: 'electrico',
    estado: 'suspendido',
    licencia: { numero: 'SEC-B-150443', clase: 'B' },
    certificado: {
      id: 'arc-cert-006',
      nombre: 'licencia-valentina.pdf',
      tipoMime: 'application/pdf',
      tamano: 201_554,
      url: '/mock-files/certificado-sec-ejemplo.pdf',
    },
    fechaRegistro: '2026-02-20T10:00:00.000Z',
    fechaEstado: '2026-08-01T09:00:00.000Z',
    motivoEstado: 'Licencia SEC vencida según registro público. Suspensión hasta acreditar renovación.',
  },
  {
    id: 'u-007',
    nombre: 'Andrés Morales Tapia',
    rut: '18.765.432-7',
    email: 'andres.morales@demo.cl',
    comuna: 'Concepción',
    rol: 'electrico',
    estado: 'pendiente',
    licencia: { numero: 'SEC-D-41877', clase: 'D' },
    certificado: {
      id: 'arc-cert-007',
      nombre: 'certificado-andres.jpg',
      tipoMime: 'image/jpeg',
      tamano: 356_870,
      url: '/mock-files/certificado-sec-ejemplo.svg',
    },
    fechaRegistro: '2026-10-22T20:15:00.000Z',
  },
];

export const credencialesSeed: Record<string, string> = Object.fromEntries(
  usuariosSeed.map((u) => [u.id, PASSWORD_DEMO]),
);

export const preferenciasDefecto: PreferenciasNotificacion = {
  emailProyectos: true,
  emailAsesorias: true,
  emailExtensiones: true,
  emailNovedades: false,
  appMensajes: true,
  appRecordatorios: true,
};

/** Accesos rápidos del login demo. */
export const usuariosDemo = [
  { etiqueta: 'Eléctrico', descripcion: 'Cuenta aprobada', email: 'electrico@demo.cl' },
  { etiqueta: 'Administrador', descripcion: 'Gestión de la plataforma', email: 'admin@demo.cl' },
  { etiqueta: 'Eléctrico pendiente', descripcion: 'En validación', email: 'pendiente@demo.cl' },
] as const;
