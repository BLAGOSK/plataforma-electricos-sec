/**
 * Usuarios, proyectos y solicitudes de demostración.
 * Las contraseñas NO están aquí: se toman de SEED_DEMO_PASSWORD.
 */
import type { CategoriaDocumento, ClaseLicencia, EstadoProyecto, EstadoSolicitudExtension, EstadoUsuario, EsquemaRevision } from '@prisma/client';

export interface SeedUsuario {
  clave: string;
  nombreCompleto: string;
  rut: string;
  email: string;
  estado: EstadoUsuario;
  licencia: { numero: string; clase: ClaseLicencia };
  telefono?: string;
  comuna?: string;
  motivoRechazo?: string;
  certificado: string;
}

export const usuariosDemo: SeedUsuario[] = [
  {
    clave: 'juan',
    nombreCompleto: 'Juan Pérez Soto',
    rut: '12.345.678-5',
    email: 'electrico@demo.cl',
    estado: 'APROBADO',
    licencia: { numero: 'SEC-B-104552', clase: 'B' },
    telefono: '+56 9 8765 4321',
    comuna: 'Providencia',
    certificado: 'certificado-sec-ejemplo.pdf',
  },
  {
    clave: 'pedro',
    nombreCompleto: 'Pedro Rojas Díaz',
    rut: '15.678.901-1',
    email: 'pendiente@demo.cl',
    estado: 'PENDIENTE',
    licencia: { numero: 'SEC-C-220981', clase: 'C' },
    comuna: 'Maipú',
    certificado: 'certificado-sec-ejemplo.pdf',
  },
  {
    clave: 'carolina',
    nombreCompleto: 'Carolina Muñoz Vera',
    rut: '16.234.567-2',
    email: 'carolina.munoz@demo.cl',
    estado: 'APROBADO',
    licencia: { numero: 'SEC-A-088120', clase: 'A' },
    telefono: '+56 9 7654 3210',
    comuna: 'Ñuñoa',
    certificado: 'certificado-sec-ejemplo.pdf',
  },
  {
    clave: 'diego',
    nombreCompleto: 'Diego Fuentes Lagos',
    rut: '17.890.123-0',
    email: 'diego.fuentes@demo.cl',
    estado: 'RECHAZADO',
    licencia: { numero: 'SEC-D-33012', clase: 'D' },
    comuna: 'La Florida',
    motivoRechazo: 'El certificado adjunto no es legible. Por favor, vuelve a registrarte con una copia nítida.',
    certificado: 'certificado-sec-ejemplo.pdf',
  },
  {
    clave: 'valentina',
    nombreCompleto: 'Valentina Castro Pino',
    rut: '13.579.246-2',
    email: 'valentina.castro@demo.cl',
    estado: 'SUSPENDIDO',
    licencia: { numero: 'SEC-B-150443', clase: 'B' },
    comuna: 'Viña del Mar',
    motivoRechazo: 'Licencia SEC vencida según registro público. Suspensión hasta acreditar renovación.',
    certificado: 'certificado-sec-ejemplo.pdf',
  },
  {
    clave: 'andres',
    nombreCompleto: 'Andrés Morales Tapia',
    rut: '18.765.432-7',
    email: 'andres.morales@demo.cl',
    estado: 'PENDIENTE',
    licencia: { numero: 'SEC-D-41877', clase: 'D' },
    comuna: 'Concepción',
    certificado: 'certificado-sec-ejemplo.pdf',
  },
];

export interface SeedRevision {
  codigo: string;
  comentario: string;
  archivo: string;
  nombre: string;
  /** Días antes de hoy */
  hace: number;
}

export interface SeedDocumento {
  nombre: string;
  categoria: CategoriaDocumento;
  esquema: EsquemaRevision;
  /** Nombre del documento requerido del tipo TE que satisface */
  requerido?: string;
  revisiones: SeedRevision[];
}

export interface SeedProyecto {
  propietario: string;
  nombre: string;
  descripcion?: string;
  tipoTE: string;
  estado: EstadoProyecto;
  cliente: { nombre: string; rut?: string; email?: string; telefono?: string };
  direccion: string;
  comuna: string;
  region: string;
  potenciaKw: number;
  folioSec?: string;
  /** Índices de requisitos del tipo TE marcados como cumplidos */
  requisitos: number[];
  documentos: SeedDocumento[];
}

const RM = 'Metropolitana de Santiago';

export const proyectosDemo: SeedProyecto[] = [
  {
    propietario: 'juan',
    nombre: 'Ampliación vivienda Familia Rojas',
    descripcion: 'Ampliación de 45 m² con nueva cocina y dos dormitorios. Se agrega un tablero de distribución secundario.',
    tipoTE: 'TE1',
    estado: 'EN_DESARROLLO',
    cliente: { nombre: 'Claudia Rojas Méndez', rut: '14.523.871-4', email: 'claudia.rojas@correo.cl', telefono: '+56 9 6123 4567' },
    direccion: 'Av. Pedro de Valdivia 1520, casa 4',
    comuna: 'Providencia',
    region: RM,
    potenciaKw: 9.5,
    requisitos: [0, 2],
    documentos: [
      {
        nombre: 'Plano de planta — primer piso',
        categoria: 'PLANO',
        esquema: 'LETRAS',
        requerido: 'Plano de planta de la instalación',
        revisiones: [
          { codigo: 'A', comentario: 'Emisión inicial para revisión del cliente.', archivo: 'plano-ejemplo.pdf', nombre: 'PL-01_planta_revA.pdf', hace: 48 },
          { codigo: 'B', comentario: 'Se reubica tablero secundario junto a la cocina y se agregan 3 enchufes.', archivo: 'plano-ejemplo.pdf', nombre: 'PL-01_planta_revB.pdf', hace: 33 },
          { codigo: 'C', comentario: 'Ajuste de circuitos de alumbrado según observaciones del arquitecto.', archivo: 'plano-ejemplo.pdf', nombre: 'PL-01_planta_revC.pdf', hace: 2 },
        ],
      },
      {
        nombre: 'Diagrama unilineal',
        categoria: 'PLANO',
        esquema: 'LETRAS',
        requerido: 'Diagrama unilineal',
        revisiones: [{ codigo: 'A', comentario: 'Emisión inicial.', archivo: 'unilineal-ejemplo.pdf', nombre: 'PL-02_unilineal_revA.pdf', hace: 31 }],
      },
      {
        nombre: 'Cuadro de cargas',
        categoria: 'TABLA',
        esquema: 'NUMEROS',
        requerido: 'Cuadro de cargas',
        revisiones: [
          { codigo: '0', comentario: 'Primera versión con 8 circuitos.', archivo: 'cuadro-cargas-ejemplo.pdf', nombre: 'cuadro_cargas_rev0.pdf', hace: 43 },
          { codigo: '1', comentario: 'Se agregan circuitos C9 (horno) y C10 (encimera de inducción).', archivo: 'cuadro-cargas-ejemplo.pdf', nombre: 'cuadro_cargas_rev1.pdf', hace: 32 },
        ],
      },
      {
        nombre: 'Fotografía tablero existente',
        categoria: 'FOTOGRAFIA',
        esquema: 'NUMEROS',
        revisiones: [{ codigo: '0', comentario: 'Registro del estado inicial del tablero.', archivo: 'foto-tablero-ejemplo.png', nombre: 'foto_tablero_existente.png', hace: 50 }],
      },
    ],
  },
  {
    propietario: 'juan',
    nombre: 'Local comercial Café Andino',
    descripcion: 'Habilitación eléctrica de cafetería con máquinas de espresso, refrigeración y alumbrado decorativo.',
    tipoTE: 'TE1',
    estado: 'LISTO_PARA_DECLARAR',
    cliente: { nombre: 'Inversiones Andino SpA', rut: '76.543.210-3', email: 'contacto@cafeandino.cl' },
    direccion: 'Irarrázaval 3050, local 2',
    comuna: 'Ñuñoa',
    region: RM,
    potenciaKw: 15,
    requisitos: [0, 1, 2, 3, 4],
    documentos: [
      {
        nombre: 'Plano de planta local',
        categoria: 'PLANO',
        esquema: 'LETRAS',
        requerido: 'Plano de planta de la instalación',
        revisiones: [
          { codigo: 'A', comentario: 'Emisión inicial.', archivo: 'plano-ejemplo.pdf', nombre: 'planta_local_revA.pdf', hace: 70 },
          { codigo: 'B', comentario: 'Se incorpora circuito exclusivo para máquina de espresso.', archivo: 'plano-ejemplo.pdf', nombre: 'planta_local_revB.pdf', hace: 57 },
        ],
      },
      {
        nombre: 'Diagrama unilineal',
        categoria: 'PLANO',
        esquema: 'LETRAS',
        requerido: 'Diagrama unilineal',
        revisiones: [{ codigo: 'A', comentario: 'Emisión inicial.', archivo: 'unilineal-ejemplo.pdf', nombre: 'unilineal_revA.pdf', hace: 70 }],
      },
      {
        nombre: 'Cuadro de cargas',
        categoria: 'TABLA',
        esquema: 'NUMEROS',
        requerido: 'Cuadro de cargas',
        revisiones: [{ codigo: '0', comentario: 'Emisión inicial.', archivo: 'cuadro-cargas-ejemplo.pdf', nombre: 'cuadro_cargas.pdf', hace: 68 }],
      },
      {
        nombre: 'Memoria de cálculo',
        categoria: 'MEMORIA_CALCULO',
        esquema: 'NUMEROS',
        requerido: 'Memoria de cálculo',
        revisiones: [
          { codigo: '0', comentario: 'Emisión inicial.', archivo: 'memoria-calculo-ejemplo.pdf', nombre: 'memoria_calculo_rev0.pdf', hace: 62 },
          { codigo: '1', comentario: 'Se corrige caída de tensión del alimentador principal (2,1 % → 1,8 %).', archivo: 'memoria-calculo-ejemplo.pdf', nombre: 'memoria_calculo_rev1.pdf', hace: 5 },
        ],
      },
      {
        nombre: 'Fotografías tablero y empalme',
        categoria: 'FOTOGRAFIA',
        esquema: 'NUMEROS',
        requerido: 'Fotografías del tablero y empalme',
        revisiones: [{ codigo: '0', comentario: 'Tablero terminado y empalme trifásico.', archivo: 'foto-tablero-ejemplo.png', nombre: 'fotos_tablero_empalme.png', hace: 22 }],
      },
    ],
  },
  {
    propietario: 'juan',
    nombre: 'Sistema fotovoltaico 6 kWp vivienda Muñoz',
    descripcion: 'Sistema de autoconsumo con 12 paneles de 500 Wp e inversor monofásico de 6 kW.',
    tipoTE: 'TE4',
    estado: 'DECLARADO',
    cliente: { nombre: 'Rodrigo Muñoz Prado', rut: '10.987.654-2', telefono: '+56 9 5544 3322' },
    direccion: 'Los Almendros 845',
    comuna: 'La Reina',
    region: RM,
    potenciaKw: 6,
    folioSec: 'TE4-2026-0084512',
    requisitos: [0, 1, 2, 3],
    documentos: [
      {
        nombre: 'Diagrama unilineal FV',
        categoria: 'PLANO',
        esquema: 'LETRAS',
        requerido: 'Diagrama unilineal del sistema de generación',
        revisiones: [{ codigo: 'A', comentario: 'Emisión inicial.', archivo: 'unilineal-ejemplo.pdf', nombre: 'unilineal_fv_revA.pdf', hace: 120 }],
      },
      {
        nombre: 'Protocolo de pruebas',
        categoria: 'CERTIFICADO',
        esquema: 'NUMEROS',
        requerido: 'Protocolo de pruebas',
        revisiones: [{ codigo: '0', comentario: 'Pruebas de aislación y polaridad.', archivo: 'protocolo-pruebas-ejemplo.pdf', nombre: 'protocolo_pruebas.pdf', hace: 85 }],
      },
    ],
  },
  {
    propietario: 'juan',
    nombre: 'Alumbrado pasaje Los Aromos',
    tipoTE: 'TE3',
    estado: 'BORRADOR',
    cliente: { nombre: 'Junta de Vecinos Villa Los Aromos' },
    direccion: 'Pasaje Los Aromos s/n',
    comuna: 'Maipú',
    region: RM,
    potenciaKw: 4.2,
    requisitos: [],
    documentos: [],
  },
  {
    propietario: 'carolina',
    nombre: 'Planta procesadora de fruta Talca',
    tipoTE: 'TE2',
    estado: 'EN_DESARROLLO',
    cliente: { nombre: 'Agroexport Maule S.A.' },
    direccion: 'Ruta 5 Sur km 255',
    comuna: 'Talca',
    region: 'Maule',
    potenciaKw: 480,
    requisitos: [],
    documentos: [
      {
        nombre: 'Diagrama unilineal planta',
        categoria: 'PLANO',
        esquema: 'LETRAS',
        requerido: 'Diagrama unilineal MT/BT',
        revisiones: [{ codigo: 'A', comentario: 'Emisión inicial.', archivo: 'unilineal-ejemplo.pdf', nombre: 'unilineal_planta.pdf', hace: 100 }],
      },
    ],
  },
];

export const solicitudesDemo: Array<{ usuario: string; extension: string; estado: EstadoSolicitudExtension; comentario?: string; motivo?: string; hace: number }> = [
  { usuario: 'juan', extension: 'conductores', estado: 'APROBADA', comentario: 'Para dimensionar alimentadores de proyectos TE1.', hace: 200 },
  { usuario: 'juan', extension: 'caida-tension', estado: 'APROBADA', hace: 200 },
  { usuario: 'juan', extension: 'cortocircuito', estado: 'PENDIENTE', comentario: 'Necesito verificar protecciones en un tablero industrial.', hace: 3 },
  { usuario: 'carolina', extension: 'alumbrado', estado: 'PENDIENTE', comentario: 'Proyecto de iluminación para oficinas.', hace: 1 },
  {
    usuario: 'carolina',
    extension: 'cortocircuito',
    estado: 'RECHAZADA',
    motivo: 'Extensión en etapa de validación técnica. Vuelve a solicitarla más adelante.',
    hace: 110,
  },
];
