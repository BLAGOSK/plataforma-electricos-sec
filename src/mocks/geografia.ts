/** Subconjunto de regiones y comunas de Chile para los formularios de la maqueta. */
export const regiones: Array<{ nombre: string; comunas: string[] }> = [
  { nombre: 'Arica y Parinacota', comunas: ['Arica', 'Putre'] },
  { nombre: 'Tarapacá', comunas: ['Iquique', 'Alto Hospicio', 'Pozo Almonte'] },
  { nombre: 'Antofagasta', comunas: ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones'] },
  { nombre: 'Atacama', comunas: ['Copiapó', 'Vallenar', 'Caldera'] },
  { nombre: 'Coquimbo', comunas: ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel'] },
  { nombre: 'Valparaíso', comunas: ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'San Antonio', 'Los Andes', 'Quillota'] },
  {
    nombre: 'Metropolitana de Santiago',
    comunas: [
      'Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'La Florida', 'Maipú', 'Puente Alto', 'Vitacura',
      'Lo Barnechea', 'Peñalolén', 'La Reina', 'Macul', 'San Miguel', 'Quilicura', 'Pudahuel', 'Colina',
      'San Bernardo', 'Estación Central', 'Recoleta', 'Independencia',
    ],
  },
  { nombre: "Libertador General Bernardo O'Higgins", comunas: ['Rancagua', 'San Fernando', 'Machalí', 'Rengo'] },
  { nombre: 'Maule', comunas: ['Talca', 'Curicó', 'Linares', 'Constitución'] },
  { nombre: 'Ñuble', comunas: ['Chillán', 'Chillán Viejo', 'San Carlos'] },
  { nombre: 'Biobío', comunas: ['Concepción', 'Talcahuano', 'San Pedro de la Paz', 'Los Ángeles', 'Coronel', 'Chiguayante'] },
  { nombre: 'La Araucanía', comunas: ['Temuco', 'Padre Las Casas', 'Villarrica', 'Angol'] },
  { nombre: 'Los Ríos', comunas: ['Valdivia', 'La Unión', 'Panguipulli'] },
  { nombre: 'Los Lagos', comunas: ['Puerto Montt', 'Osorno', 'Castro', 'Puerto Varas'] },
  { nombre: 'Aysén', comunas: ['Coyhaique', 'Puerto Aysén'] },
  { nombre: 'Magallanes', comunas: ['Punta Arenas', 'Puerto Natales'] },
];
