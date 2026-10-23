import type { Extension, SolicitudExtension } from '@/types/extension';

export const extensionesSeed: Extension[] = [
  {
    id: 'ext-001',
    slug: 'conductores',
    nombre: 'Dimensionamiento de conductores',
    descripcionCorta: 'Sección mínima de conductores según corriente, método de instalación y factores de corrección.',
    descripcion:
      'Calcula la sección de conductores a partir de la potencia o corriente de diseño, considerando el método de canalización, la temperatura ambiente y la agrupación de circuitos.',
    caracteristicas: [
      'Corriente de diseño a partir de potencia y factor de potencia',
      'Factores de corrección por temperatura y agrupamiento',
      'Sugerencia de sección y protección',
    ],
  },
  {
    id: 'ext-002',
    slug: 'caida-tension',
    nombre: 'Cálculo de caída de tensión',
    descripcionCorta: 'Verifica la caída de tensión en alimentadores y circuitos.',
    descripcion:
      'Determina la caída de tensión porcentual de un circuito monofásico o trifásico según su longitud, sección, material y corriente, comparándola con el límite admisible.',
    caracteristicas: [
      'Circuitos monofásicos y trifásicos',
      'Conductores de cobre o aluminio',
      'Comparación con límite admisible configurable',
    ],
  },
  {
    id: 'ext-003',
    slug: 'cortocircuito',
    nombre: 'Corriente de cortocircuito',
    descripcionCorta: 'Estimación de la corriente de cortocircuito en el punto de instalación.',
    descripcion:
      'Estima la corriente de cortocircuito trifásica y monofásica a partir de los datos del transformador o empalme y de la impedancia de los conductores.',
    caracteristicas: [
      'Datos de transformador o red',
      'Impedancia de alimentadores',
      'Verificación de capacidad de ruptura de protecciones',
    ],
  },
  {
    id: 'ext-004',
    slug: 'alumbrado',
    nombre: 'Cálculo de alumbrado',
    descripcionCorta: 'Diseño de iluminación interior estilo Dialux con vista de grilla del recinto.',
    descripcion:
      'Define las dimensiones del recinto, el tipo de luminaria y el nivel de iluminación objetivo para obtener la cantidad y distribución de luminarias.',
    caracteristicas: [
      'Dimensiones del recinto y alturas de trabajo',
      'Catálogo de luminarias y reflectancias',
      'Vista en grilla de la distribución',
    ],
  },
];

export const solicitudesExtensionSeed: SolicitudExtension[] = [
  {
    id: 'sol-001',
    usuarioId: 'u-001',
    extensionId: 'ext-001',
    estado: 'activa',
    comentario: 'Para dimensionar alimentadores de proyectos TE1.',
    fechaSolicitud: '2026-04-02T10:00:00.000Z',
    fechaResolucion: '2026-04-03T09:00:00.000Z',
  },
  {
    id: 'sol-002',
    usuarioId: 'u-001',
    extensionId: 'ext-002',
    estado: 'activa',
    fechaSolicitud: '2026-04-02T10:05:00.000Z',
    fechaResolucion: '2026-04-03T09:01:00.000Z',
  },
  {
    id: 'sol-003',
    usuarioId: 'u-001',
    extensionId: 'ext-003',
    estado: 'pendiente',
    comentario: 'Necesito verificar protecciones en un tablero industrial.',
    fechaSolicitud: '2026-10-20T15:30:00.000Z',
  },
  {
    id: 'sol-004',
    usuarioId: 'u-004',
    extensionId: 'ext-004',
    estado: 'pendiente',
    comentario: 'Proyecto de iluminación para oficinas.',
    fechaSolicitud: '2026-10-22T12:00:00.000Z',
  },
  {
    id: 'sol-005',
    usuarioId: 'u-004',
    extensionId: 'ext-003',
    estado: 'rechazada',
    fechaSolicitud: '2026-07-01T12:00:00.000Z',
    fechaResolucion: '2026-07-02T12:00:00.000Z',
    motivoRechazo: 'Extensión en etapa de validación técnica. Vuelve a solicitarla más adelante.',
  },
];
