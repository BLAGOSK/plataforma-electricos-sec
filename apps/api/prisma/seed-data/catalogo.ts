/**
 * Contenido de ejemplo del catálogo: tipos TE, normativa, material de apoyo y extensiones.
 * CONTENIDO REFERENCIAL A VALIDAR contra las publicaciones oficiales de la SEC.
 */
import type { CategoriaDocumento, CategoriaMaterial, CategoriaNormativa } from '@prisma/client';

export interface SeedTipoTE {
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  documentos: Array<{ nombre: string; categoria: CategoriaDocumento; obligatorio: boolean; descripcion?: string }>;
  /** Pasos de la guía con los números de pliegos RIC que referencian (ej. '18') */
  guia: Array<{ titulo: string; descripcion: string; ric?: string[] }>;
  requisitos: string[];
  /** Pliegos RIC aplicables (relación TipoTE ↔ DocumentoNormativo) */
  ric: string[];
}

export const tiposTE: SeedTipoTE[] = [
  {
    codigo: 'TE1',
    nombre: 'Instalación de consumo en baja tensión',
    descripcion: 'Declaración de instalaciones interiores de consumo en baja tensión: viviendas, locales comerciales, oficinas y pequeñas industrias.',
    activo: true,
    documentos: [
      { nombre: 'Plano de planta de la instalación', categoria: 'PLANO', obligatorio: true, descripcion: 'Ubicación de tableros, circuitos, enchufes y alumbrado.' },
      { nombre: 'Diagrama unilineal', categoria: 'PLANO', obligatorio: true },
      { nombre: 'Cuadro de cargas', categoria: 'TABLA', obligatorio: true },
      { nombre: 'Memoria de cálculo', categoria: 'MEMORIA_CALCULO', obligatorio: true, descripcion: 'Dimensionamiento de alimentadores, protecciones y caída de tensión.' },
      { nombre: 'Fotografías del tablero y empalme', categoria: 'FOTOGRAFIA', obligatorio: true },
      { nombre: 'Medición de resistencia de puesta a tierra', categoria: 'CERTIFICADO', obligatorio: false },
    ],
    guia: [
      { titulo: 'Reúne los antecedentes del proyecto', descripcion: 'Datos del propietario, dirección exacta, número de cliente de la distribuidora y potencia a declarar.' },
      { titulo: 'Elabora planos y cuadro de cargas', descripcion: 'Plano de planta, diagrama unilineal y cuadro de cargas por circuito, con simbología normalizada.', ric: ['18'] },
      { titulo: 'Redacta la memoria de cálculo', descripcion: 'Justifica secciones de conductores, protecciones, caída de tensión y puesta a tierra.', ric: ['03', '04', '05'] },
      { titulo: 'Realiza inspección y mediciones', descripcion: 'Verifica continuidad, aislación y resistencia de puesta a tierra. Registra fotografías.', ric: ['06', '19'] },
      { titulo: 'Ingresa la declaración en el portal SEC', descripcion: 'Completa el formulario TE1 en línea y adjunta los documentos en los formatos exigidos.' },
      { titulo: 'Seguimiento y respuesta a observaciones', descripcion: 'Atiende las observaciones de la SEC y guarda el comprobante de la declaración.' },
    ],
    requisitos: [
      'Licencia SEC vigente acorde a la potencia y tipo de instalación',
      'Planos firmados por el instalador responsable',
      'Protecciones diferenciales en circuitos de enchufes',
      'Puesta a tierra de protección medida y registrada',
      'Documentos en formato PDF legible',
    ],
    ric: ['02', '03', '04', '05', '06', '10', '18', '19'],
  },
  {
    codigo: 'TE2',
    nombre: 'Instalación de consumo en media tensión',
    descripcion: 'Declaración de instalaciones de consumo alimentadas en media tensión, incluyendo subestaciones particulares y salas eléctricas.',
    activo: true,
    documentos: [
      { nombre: 'Plano de planta y disposición de equipos', categoria: 'PLANO', obligatorio: true },
      { nombre: 'Diagrama unilineal MT/BT', categoria: 'PLANO', obligatorio: true },
      { nombre: 'Memoria de cálculo de subestación', categoria: 'MEMORIA_CALCULO', obligatorio: true },
      { nombre: 'Estudio de coordinación de protecciones', categoria: 'MEMORIA_CALCULO', obligatorio: true },
      { nombre: 'Certificado de ensayo del transformador', categoria: 'CERTIFICADO', obligatorio: true },
      { nombre: 'Medición de malla de puesta a tierra', categoria: 'CERTIFICADO', obligatorio: true },
      { nombre: 'Fotografías de la subestación', categoria: 'FOTOGRAFIA', obligatorio: true },
    ],
    guia: [
      { titulo: 'Factibilidad con la distribuidora', descripcion: 'Solicita la factibilidad de suministro en media tensión y define el punto de conexión.' },
      { titulo: 'Diseño de la subestación', descripcion: 'Dimensiona transformador, celdas, protecciones y malla de tierra.', ric: ['13', '14'] },
      { titulo: 'Estudio de protecciones', descripcion: 'Coordina las protecciones MT/BT y verifica niveles de cortocircuito.', ric: ['14'] },
      { titulo: 'Ensayos y mediciones', descripcion: 'Ensayos del transformador, medición de malla y pruebas de equipos.', ric: ['06', '19'] },
      { titulo: 'Declaración TE2 en el portal SEC', descripcion: 'Adjunta planos, memorias y certificados de ensayo.', ric: ['18'] },
    ],
    requisitos: ['Licencia clase A vigente', 'Factibilidad de la empresa distribuidora', 'Certificados de ensayo de equipos MT', 'Señalética de seguridad en sala eléctrica'],
    ric: ['06', '13', '14', '18', '19'],
  },
  {
    codigo: 'TE3',
    nombre: 'Instalación de alumbrado público',
    descripcion: 'Declaración de proyectos de alumbrado público y alumbrado de espacios exteriores.',
    activo: true,
    documentos: [
      { nombre: 'Plano de ubicación de luminarias', categoria: 'PLANO', obligatorio: true },
      { nombre: 'Cálculo lumínico', categoria: 'MEMORIA_CALCULO', obligatorio: true },
      { nombre: 'Cuadro de cargas por circuito', categoria: 'TABLA', obligatorio: true },
      { nombre: 'Certificados de luminarias', categoria: 'CERTIFICADO', obligatorio: true },
    ],
    guia: [
      { titulo: 'Levantamiento del área', descripcion: 'Define vías, clases de iluminación y postación existente.' },
      { titulo: 'Cálculo lumínico', descripcion: 'Determina luminarias, alturas e interdistancias para cumplir los niveles requeridos.', ric: ['11'] },
      { titulo: 'Diseño eléctrico', descripcion: 'Circuitos, protecciones, control y medida.', ric: ['04'] },
      { titulo: 'Declaración TE3', descripcion: 'Ingresa la declaración con planos, cálculo y certificados.', ric: ['18'] },
    ],
    requisitos: ['Luminarias con certificación vigente', 'Cálculo lumínico con software reconocido', 'Autorización municipal cuando corresponda'],
    ric: ['04', '11', '18'],
  },
  {
    codigo: 'TE4',
    nombre: 'Equipamiento de generación (autoconsumo)',
    descripcion: 'Comunicación de puesta en servicio de equipamiento de generación conectado a la red de distribución, como sistemas fotovoltaicos de autoconsumo.',
    activo: true,
    documentos: [
      { nombre: 'Diagrama unilineal del sistema de generación', categoria: 'PLANO', obligatorio: true },
      { nombre: 'Memoria explicativa y de cálculo', categoria: 'MEMORIA_CALCULO', obligatorio: true },
      { nombre: 'Certificados de inversores y paneles', categoria: 'CERTIFICADO', obligatorio: true },
      { nombre: 'Fotografías de la instalación', categoria: 'FOTOGRAFIA', obligatorio: true },
      { nombre: 'Protocolo de pruebas', categoria: 'CERTIFICADO', obligatorio: true },
    ],
    guia: [
      { titulo: 'Solicitud de conexión a la distribuidora', descripcion: 'Envía la solicitud de información y conexión con la capacidad a instalar.' },
      { titulo: 'Diseño del sistema', descripcion: 'Dimensiona arreglo fotovoltaico, inversor, protecciones CC/CA y puesta a tierra.', ric: ['09', '05', '06'] },
      { titulo: 'Instalación y pruebas', descripcion: 'Ejecuta la instalación y realiza el protocolo de pruebas.', ric: ['19'] },
      { titulo: 'Comunicación TE4 a la SEC', descripcion: 'Declara la puesta en servicio adjuntando certificados y fotografías.', ric: ['18'] },
      { titulo: 'Notificación a la distribuidora', descripcion: 'Coordina el cambio de medidor y la conexión definitiva.' },
    ],
    requisitos: [
      'Inversores y paneles autorizados por la SEC',
      'Protecciones de corriente continua y alterna',
      'Señalética de doble alimentación',
      'Respuesta de la distribuidora a la solicitud de conexión',
    ],
    ric: ['05', '06', '09', '18', '19'],
  },
  {
    codigo: 'TE6',
    nombre: 'Infraestructura de recarga de vehículos eléctricos',
    descripcion: 'Declaración de instalaciones de cargadores para vehículos eléctricos en recintos residenciales o comerciales.',
    activo: false,
    documentos: [
      { nombre: 'Plano de ubicación de cargadores', categoria: 'PLANO', obligatorio: true },
      { nombre: 'Memoria de cálculo del alimentador', categoria: 'MEMORIA_CALCULO', obligatorio: true },
      { nombre: 'Certificado del cargador', categoria: 'CERTIFICADO', obligatorio: true },
    ],
    guia: [
      { titulo: 'Evaluación de capacidad', descripcion: 'Verifica la capacidad del empalme y tablero existente.' },
      { titulo: 'Diseño y declaración', descripcion: 'Diseña el alimentador dedicado y declara la instalación.', ric: ['15', '18'] },
    ],
    requisitos: ['Cargador con certificación SEC'],
    ric: ['15', '18'],
  },
];

export interface SeedNormativo {
  numero: string;
  titulo: string;
  descripcion: string;
  categoria: CategoriaNormativa;
  version: string;
  fecha: string;
  archivo: string;
  /** Códigos TE relacionados (además de los derivados de `ric` en los tipos TE) */
  tiposTE?: string[];
}

const ric: Array<[string, string, string]> = [
  ['01', 'Empalmes', 'Requisitos para el diseño y ejecución de empalmes en baja tensión.'],
  ['02', 'Tableros eléctricos', 'Características constructivas, ubicación y protecciones de tableros.'],
  ['03', 'Alimentadores y demanda de una instalación', 'Cálculo de demanda y dimensionamiento de alimentadores.'],
  ['04', 'Conductores, materiales y sistemas de canalización', 'Tipos de conductores, capacidades de corriente y canalizaciones.'],
  ['05', 'Medidas de protección contra tensiones peligrosas y descargas eléctricas', 'Protección contra contactos directos e indirectos.'],
  ['06', 'Puesta a tierra y enlace equipotencial', 'Sistemas de puesta a tierra de protección y de servicio.'],
  ['07', 'Instalaciones de equipos', 'Conexión de motores, equipos de climatización y otros equipos.'],
  ['08', 'Sistemas de emergencia', 'Alumbrado de emergencia y respaldo de energía.'],
  ['09', 'Sistemas de autogeneración', 'Generación para autoconsumo y su conexión a la instalación.'],
  ['10', 'Instalaciones de uso general', 'Viviendas, oficinas y locales comerciales.'],
  ['11', 'Instalaciones especiales', 'Piscinas, recintos médicos, ferias, alumbrado exterior y otros.'],
  ['12', 'Instalaciones en ambientes explosivos', 'Clasificación de áreas y equipos en atmósferas explosivas.'],
  ['13', 'Subestaciones y salas eléctricas', 'Diseño y seguridad de subestaciones y salas eléctricas.'],
  ['14', 'Instalaciones de consumo en media tensión', 'Requisitos para instalaciones alimentadas en media tensión.'],
  ['15', 'Infraestructura para la recarga de vehículos eléctricos', 'Instalaciones de carga de vehículos eléctricos.'],
  ['16', 'Sistemas de almacenamiento de energía', 'Bancos de baterías y sistemas de almacenamiento.'],
  ['17', 'Operación y mantenimiento', 'Obligaciones de operación y mantenimiento de las instalaciones.'],
  ['18', 'Presentación de proyectos', 'Contenido y formato de planos, memorias y declaraciones.'],
  ['19', 'Puesta en servicio', 'Inspecciones, pruebas y mediciones previas a la energización.'],
];

export const normativa: SeedNormativo[] = [
  ...ric.map(([n, titulo, descripcion]) => ({
    numero: `RIC N°${n}`,
    titulo,
    descripcion,
    categoria: 'PLIEGO_RIC' as const,
    version: n === '04' || n === '10' ? 'Ed. 2 (2023)' : 'Ed. 1 (2020)',
    fecha: n === '04' || n === '10' ? '2023-03-01' : '2020-11-01',
    archivo: `pliego-ric-${n}.pdf`,
  })),
  {
    numero: 'DS N°8/2019',
    titulo: 'Reglamento de seguridad de las instalaciones de consumo de energía eléctrica',
    descripcion: 'Reglamento que establece los requisitos de seguridad que deben cumplir las instalaciones de consumo.',
    categoria: 'REGLAMENTO',
    version: 'Texto vigente',
    fecha: '2020-01-01',
    archivo: 'reglamento-ds8.pdf',
    tiposTE: ['TE1', 'TE2', 'TE3', 'TE4', 'TE6'],
  },
  {
    numero: 'INST-TE1',
    titulo: 'Instructivo de declaración TE1 en plataforma SEC',
    descripcion: 'Paso a paso del ingreso de declaraciones de instalaciones de consumo en baja tensión.',
    categoria: 'INSTRUCTIVO',
    version: 'v2.1',
    fecha: '2025-06-15',
    archivo: 'instructivo-te1.pdf',
    tiposTE: ['TE1'],
  },
  {
    numero: 'INST-TE4',
    titulo: 'Instructivo de comunicación de equipamiento de generación (TE4)',
    descripcion: 'Requisitos y antecedentes para comunicar la puesta en servicio de sistemas de autogeneración.',
    categoria: 'INSTRUCTIVO',
    version: 'v1.4',
    fecha: '2025-09-01',
    archivo: 'instructivo-te4.pdf',
    tiposTE: ['TE4'],
  },
  {
    numero: 'GUIA-01',
    titulo: 'Guía de simbología eléctrica para planos',
    descripcion: 'Simbología recomendada para planos de instalaciones de consumo.',
    categoria: 'GUIA',
    version: '2024',
    fecha: '2024-04-01',
    archivo: 'guia-simbologia.pdf',
    tiposTE: ['TE1', 'TE2', 'TE3'],
  },
  {
    numero: 'NCh Elec. 2/84',
    titulo: 'Elaboración y presentación de proyectos (norma histórica)',
    descripcion: 'Norma anterior al RIC, útil como referencia histórica para proyectos existentes.',
    categoria: 'NORMA',
    version: '1984',
    fecha: '1984-01-01',
    archivo: 'nch-elec-2-84.pdf',
    tiposTE: ['TE1'],
  },
];

export interface SeedMaterial {
  titulo: string;
  descripcion: string;
  categoria: CategoriaMaterial;
  duracionSeg: number;
  autor: string;
  publicadoAt: string;
  tiposTE: string[];
  adjuntos: Array<{ nombre: string; archivo: string }>;
}

export const material: SeedMaterial[] = [
  {
    titulo: 'Cómo preparar una declaración TE1 paso a paso',
    descripcion: 'Recorrido completo por la preparación de una declaración TE1: antecedentes, planos, cuadro de cargas, memoria de cálculo e ingreso en el portal.',
    categoria: 'TUTORIAL',
    duracionSeg: 1475,
    autor: 'Equipo Eléctricos SEC',
    publicadoAt: '2026-05-10',
    tiposTE: ['TE1'],
    adjuntos: [
      { nombre: 'checklist-declaracion-te1.pdf', archivo: 'memoria-calculo-ejemplo.pdf' },
      { nombre: 'plantilla-cuadro-cargas.pdf', archivo: 'cuadro-cargas-ejemplo.pdf' },
    ],
  },
  {
    titulo: 'Sistemas fotovoltaicos de autoconsumo: diseño y comunicación TE4',
    descripcion: 'Dimensionamiento del arreglo, selección de inversor, protecciones CC/CA y antecedentes para la comunicación TE4.',
    categoria: 'TUTORIAL',
    duracionSeg: 2310,
    autor: 'Ing. Roberto Saavedra',
    publicadoAt: '2026-06-02',
    tiposTE: ['TE4'],
    adjuntos: [{ nombre: 'protocolo-pruebas-fv.pdf', archivo: 'protocolo-pruebas-ejemplo.pdf' }],
  },
  {
    titulo: 'Simbología eléctrica para planos',
    descripcion: 'Repaso de la simbología normalizada y buenas prácticas para planos claros y revisables.',
    categoria: 'NORMATIVA',
    duracionSeg: 845,
    autor: 'Equipo Eléctricos SEC',
    publicadoAt: '2026-03-18',
    tiposTE: ['TE1', 'TE2', 'TE3'],
    adjuntos: [{ nombre: 'guia-simbologia.pdf', archivo: 'guia-simbologia.pdf' }],
  },
  {
    titulo: 'Subestaciones particulares: conceptos clave',
    descripcion: 'Webinar sobre diseño de subestaciones aéreas y de patio, coordinación de protecciones y mallas de tierra.',
    categoria: 'WEBINAR',
    duracionSeg: 3620,
    autor: 'Ing. Camila Herrera',
    publicadoAt: '2026-07-22',
    tiposTE: ['TE2'],
    adjuntos: [],
  },
  {
    titulo: 'Fundamentos de cálculo de alumbrado',
    descripcion: 'Niveles de iluminación, método de lúmenes y uso de software de cálculo para interiores y exteriores.',
    categoria: 'TUTORIAL',
    duracionSeg: 1920,
    autor: 'Ing. Felipe Araya',
    publicadoAt: '2026-08-05',
    tiposTE: ['TE3'],
    adjuntos: [],
  },
  {
    titulo: 'Caso práctico: observaciones frecuentes en declaraciones',
    descripcion: 'Análisis de las observaciones más comunes y cómo evitarlas en la presentación de proyectos.',
    categoria: 'CASO_PRACTICO',
    duracionSeg: 1265,
    autor: 'Equipo Eléctricos SEC',
    publicadoAt: '2026-09-12',
    tiposTE: ['TE1', 'TE4'],
    adjuntos: [],
  },
  {
    titulo: 'Puesta a tierra: medición con telurómetro',
    descripcion: 'Procedimiento de medición de resistencia de puesta a tierra con el método de caída de potencial.',
    categoria: 'TUTORIAL',
    duracionSeg: 1110,
    autor: 'Ing. Roberto Saavedra',
    publicadoAt: '2026-10-01',
    tiposTE: ['TE1', 'TE2', 'TE4'],
    adjuntos: [{ nombre: 'formulario-medicion-pat.pdf', archivo: 'protocolo-pruebas-ejemplo.pdf' }],
  },
];

export const extensiones = [
  {
    slug: 'conductores',
    nombre: 'Dimensionamiento de conductores',
    descripcionCorta: 'Sección mínima de conductores según corriente, método de instalación y factores de corrección.',
    descripcion:
      'Calcula la sección de conductores a partir de la potencia o corriente de diseño, considerando el método de canalización, la temperatura ambiente y la agrupación de circuitos.',
    caracteristicas: ['Corriente de diseño a partir de potencia y factor de potencia', 'Factores de corrección por temperatura y agrupamiento', 'Sugerencia de sección y protección'],
  },
  {
    slug: 'caida-tension',
    nombre: 'Cálculo de caída de tensión',
    descripcionCorta: 'Verifica la caída de tensión en alimentadores y circuitos.',
    descripcion:
      'Determina la caída de tensión porcentual de un circuito monofásico o trifásico según su longitud, sección, material y corriente, comparándola con el límite admisible.',
    caracteristicas: ['Circuitos monofásicos y trifásicos', 'Conductores de cobre o aluminio', 'Comparación con límite admisible configurable'],
  },
  {
    slug: 'cortocircuito',
    nombre: 'Corriente de cortocircuito',
    descripcionCorta: 'Estimación de la corriente de cortocircuito en el punto de instalación.',
    descripcion:
      'Estima la corriente de cortocircuito trifásica y monofásica a partir de los datos del transformador o empalme y de la impedancia de los conductores.',
    caracteristicas: ['Datos de transformador o red', 'Impedancia de alimentadores', 'Verificación de capacidad de ruptura de protecciones'],
  },
  {
    slug: 'alumbrado',
    nombre: 'Cálculo de alumbrado',
    descripcionCorta: 'Diseño de iluminación interior estilo Dialux con vista de grilla del recinto.',
    descripcion: 'Define las dimensiones del recinto, el tipo de luminaria y el nivel de iluminación objetivo para obtener la cantidad y distribución de luminarias.',
    caracteristicas: ['Dimensiones del recinto y alturas de trabajo', 'Catálogo de luminarias y reflectancias', 'Vista en grilla de la distribución'],
  },
];
