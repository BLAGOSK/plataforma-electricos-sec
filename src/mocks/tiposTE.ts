/**
 * Catálogo de tipos de declaración TE.
 * CONTENIDO REFERENCIAL A VALIDAR: códigos, nombres, documentos y pasos son
 * ejemplos para la maqueta y deben contrastarse con la normativa SEC vigente.
 */
import type { TipoTE } from '@/types/tipoTE';

export const tiposTESeed: TipoTE[] = [
  {
    id: 'te-1',
    codigo: 'TE1',
    nombre: 'Instalación de consumo en baja tensión',
    descripcion:
      'Declaración de instalaciones interiores de consumo en baja tensión: viviendas, locales comerciales, oficinas y pequeñas industrias.',
    activo: true,
    referencial: true,
    documentosRequeridos: [
      { id: 'req-te1-1', nombre: 'Plano de planta de la instalación', categoria: 'planos', obligatorio: true, descripcion: 'Ubicación de tableros, circuitos, enchufes y alumbrado.' },
      { id: 'req-te1-2', nombre: 'Diagrama unilineal', categoria: 'planos', obligatorio: true },
      { id: 'req-te1-3', nombre: 'Cuadro de cargas', categoria: 'cuadros_carga', obligatorio: true },
      { id: 'req-te1-4', nombre: 'Memoria de cálculo', categoria: 'memoria_calculo', obligatorio: true, descripcion: 'Dimensionamiento de alimentadores, protecciones y caída de tensión.' },
      { id: 'req-te1-5', nombre: 'Fotografías del tablero y empalme', categoria: 'fotografias', obligatorio: true },
      { id: 'req-te1-6', nombre: 'Medición de resistencia de puesta a tierra', categoria: 'certificados', obligatorio: false },
    ],
    guia: [
      { titulo: 'Reúne los antecedentes del proyecto', descripcion: 'Datos del propietario, dirección exacta, número de cliente de la distribuidora y potencia a declarar.' },
      { titulo: 'Elabora planos y cuadro de cargas', descripcion: 'Plano de planta, diagrama unilineal y cuadro de cargas por circuito, con simbología normalizada.' },
      { titulo: 'Redacta la memoria de cálculo', descripcion: 'Justifica secciones de conductores, protecciones, caída de tensión y puesta a tierra.' },
      { titulo: 'Realiza inspección y mediciones', descripcion: 'Verifica continuidad, aislación y resistencia de puesta a tierra. Registra fotografías.' },
      { titulo: 'Ingresa la declaración en el portal SEC', descripcion: 'Completa el formulario TE1 en línea y adjunta los documentos en los formatos exigidos.' },
      { titulo: 'Seguimiento y respuesta a observaciones', descripcion: 'Atiende las observaciones de la SEC y guarda el comprobante de la declaración.' },
    ],
    requisitos: [
      { id: 'chk-te1-1', texto: 'Licencia SEC vigente acorde a la potencia y tipo de instalación' },
      { id: 'chk-te1-2', texto: 'Planos firmados por el instalador responsable' },
      { id: 'chk-te1-3', texto: 'Protecciones diferenciales en circuitos de enchufes' },
      { id: 'chk-te1-4', texto: 'Puesta a tierra de protección medida y registrada' },
      { id: 'chk-te1-5', texto: 'Documentos en formato PDF legible' },
    ],
    materialApoyo: [
      { titulo: 'Cómo preparar una declaración TE1 paso a paso', tipo: 'video', to: '/aprendizaje/videos/vid-01' },
      { titulo: 'Simbología eléctrica para planos', tipo: 'video', to: '/aprendizaje/videos/vid-03' },
      { titulo: 'Portal de declaraciones SEC', tipo: 'enlace', to: 'https://www.sec.cl' },
    ],
  },
  {
    id: 'te-2',
    codigo: 'TE2',
    nombre: 'Instalación de consumo en media tensión',
    descripcion:
      'Declaración de instalaciones de consumo alimentadas en media tensión, incluyendo subestaciones particulares y salas eléctricas.',
    activo: true,
    referencial: true,
    documentosRequeridos: [
      { id: 'req-te2-1', nombre: 'Plano de planta y disposición de equipos', categoria: 'planos', obligatorio: true },
      { id: 'req-te2-2', nombre: 'Diagrama unilineal MT/BT', categoria: 'planos', obligatorio: true },
      { id: 'req-te2-3', nombre: 'Memoria de cálculo de subestación', categoria: 'memoria_calculo', obligatorio: true },
      { id: 'req-te2-4', nombre: 'Estudio de coordinación de protecciones', categoria: 'memoria_calculo', obligatorio: true },
      { id: 'req-te2-5', nombre: 'Certificado de ensayo del transformador', categoria: 'certificados', obligatorio: true },
      { id: 'req-te2-6', nombre: 'Medición de malla de puesta a tierra', categoria: 'certificados', obligatorio: true },
      { id: 'req-te2-7', nombre: 'Fotografías de la subestación', categoria: 'fotografias', obligatorio: true },
    ],
    guia: [
      { titulo: 'Factibilidad con la distribuidora', descripcion: 'Solicita la factibilidad de suministro en media tensión y define el punto de conexión.' },
      { titulo: 'Diseño de la subestación', descripcion: 'Dimensiona transformador, celdas, protecciones y malla de tierra.' },
      { titulo: 'Estudio de protecciones', descripcion: 'Coordina las protecciones MT/BT y verifica niveles de cortocircuito.' },
      { titulo: 'Ensayos y mediciones', descripcion: 'Ensayos del transformador, medición de malla y pruebas de equipos.' },
      { titulo: 'Declaración TE2 en el portal SEC', descripcion: 'Adjunta planos, memorias y certificados de ensayo.' },
    ],
    requisitos: [
      { id: 'chk-te2-1', texto: 'Licencia clase A vigente' },
      { id: 'chk-te2-2', texto: 'Factibilidad de la empresa distribuidora' },
      { id: 'chk-te2-3', texto: 'Certificados de ensayo de equipos MT' },
      { id: 'chk-te2-4', texto: 'Señalética de seguridad en sala eléctrica' },
    ],
    materialApoyo: [
      { titulo: 'Subestaciones particulares: conceptos clave', tipo: 'video', to: '/aprendizaje/videos/vid-04' },
      { titulo: 'Coordinación de protecciones', tipo: 'documento', to: '/aprendizaje/pliegos/ric-14' },
    ],
  },
  {
    id: 'te-3',
    codigo: 'TE3',
    nombre: 'Instalación de alumbrado público',
    descripcion: 'Declaración de proyectos de alumbrado público y alumbrado de espacios exteriores.',
    activo: true,
    referencial: true,
    documentosRequeridos: [
      { id: 'req-te3-1', nombre: 'Plano de ubicación de luminarias', categoria: 'planos', obligatorio: true },
      { id: 'req-te3-2', nombre: 'Cálculo lumínico', categoria: 'memoria_calculo', obligatorio: true },
      { id: 'req-te3-3', nombre: 'Cuadro de cargas por circuito', categoria: 'cuadros_carga', obligatorio: true },
      { id: 'req-te3-4', nombre: 'Certificados de luminarias', categoria: 'certificados', obligatorio: true },
    ],
    guia: [
      { titulo: 'Levantamiento del área', descripcion: 'Define vías, clases de iluminación y postación existente.' },
      { titulo: 'Cálculo lumínico', descripcion: 'Determina luminarias, alturas e interdistancias para cumplir los niveles requeridos.' },
      { titulo: 'Diseño eléctrico', descripcion: 'Circuitos, protecciones, control y medida.' },
      { titulo: 'Declaración TE3', descripcion: 'Ingresa la declaración con planos, cálculo y certificados.' },
    ],
    requisitos: [
      { id: 'chk-te3-1', texto: 'Luminarias con certificación vigente' },
      { id: 'chk-te3-2', texto: 'Cálculo lumínico con software reconocido' },
      { id: 'chk-te3-3', texto: 'Autorización municipal cuando corresponda' },
    ],
    materialApoyo: [{ titulo: 'Fundamentos de cálculo de alumbrado', tipo: 'video', to: '/aprendizaje/videos/vid-05' }],
  },
  {
    id: 'te-4',
    codigo: 'TE4',
    nombre: 'Equipamiento de generación (autoconsumo)',
    descripcion:
      'Comunicación de puesta en servicio de equipamiento de generación conectado a la red de distribución, como sistemas fotovoltaicos de autoconsumo.',
    activo: true,
    referencial: true,
    documentosRequeridos: [
      { id: 'req-te4-1', nombre: 'Diagrama unilineal del sistema de generación', categoria: 'planos', obligatorio: true },
      { id: 'req-te4-2', nombre: 'Memoria explicativa y de cálculo', categoria: 'memoria_calculo', obligatorio: true },
      { id: 'req-te4-3', nombre: 'Certificados de inversores y paneles', categoria: 'certificados', obligatorio: true },
      { id: 'req-te4-4', nombre: 'Fotografías de la instalación', categoria: 'fotografias', obligatorio: true },
      { id: 'req-te4-5', nombre: 'Protocolo de pruebas', categoria: 'certificados', obligatorio: true },
    ],
    guia: [
      { titulo: 'Solicitud de conexión a la distribuidora', descripcion: 'Envía la solicitud de información y conexión con la capacidad a instalar.' },
      { titulo: 'Diseño del sistema', descripcion: 'Dimensiona arreglo fotovoltaico, inversor, protecciones CC/CA y puesta a tierra.' },
      { titulo: 'Instalación y pruebas', descripcion: 'Ejecuta la instalación y realiza el protocolo de pruebas.' },
      { titulo: 'Comunicación TE4 a la SEC', descripcion: 'Declara la puesta en servicio adjuntando certificados y fotografías.' },
      { titulo: 'Notificación a la distribuidora', descripcion: 'Coordina el cambio de medidor y la conexión definitiva.' },
    ],
    requisitos: [
      { id: 'chk-te4-1', texto: 'Inversores y paneles autorizados por la SEC' },
      { id: 'chk-te4-2', texto: 'Protecciones de corriente continua y alterna' },
      { id: 'chk-te4-3', texto: 'Señalética de doble alimentación' },
      { id: 'chk-te4-4', texto: 'Respuesta de la distribuidora a la solicitud de conexión' },
    ],
    materialApoyo: [
      { titulo: 'Sistemas fotovoltaicos de autoconsumo', tipo: 'video', to: '/aprendizaje/videos/vid-02' },
      { titulo: 'Pliego RIC N°09 - Autogeneración', tipo: 'documento', to: '/aprendizaje/pliegos/ric-09' },
    ],
  },
  {
    id: 'te-6',
    codigo: 'TE6',
    nombre: 'Infraestructura de recarga de vehículos eléctricos',
    descripcion: 'Declaración de instalaciones de cargadores para vehículos eléctricos en recintos residenciales o comerciales.',
    activo: false,
    referencial: true,
    documentosRequeridos: [
      { id: 'req-te6-1', nombre: 'Plano de ubicación de cargadores', categoria: 'planos', obligatorio: true },
      { id: 'req-te6-2', nombre: 'Memoria de cálculo del alimentador', categoria: 'memoria_calculo', obligatorio: true },
      { id: 'req-te6-3', nombre: 'Certificado del cargador', categoria: 'certificados', obligatorio: true },
    ],
    guia: [
      { titulo: 'Evaluación de capacidad', descripcion: 'Verifica la capacidad del empalme y tablero existente.' },
      { titulo: 'Diseño y declaración', descripcion: 'Diseña el alimentador dedicado y declara la instalación.' },
    ],
    requisitos: [{ id: 'chk-te6-1', texto: 'Cargador con certificación SEC' }],
    materialApoyo: [],
  },
];
