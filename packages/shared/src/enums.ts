/**
 * Enums de dominio compartidos entre la API (Prisma) y el frontend.
 * Los valores deben coincidir exactamente con los enums de apps/api/prisma/schema.prisma.
 */

export const Rol = { ELECTRICO: 'ELECTRICO', ADMIN: 'ADMIN', ASESOR: 'ASESOR' } as const;
export type Rol = (typeof Rol)[keyof typeof Rol];

export const EstadoUsuario = { PENDIENTE: 'PENDIENTE', APROBADO: 'APROBADO', RECHAZADO: 'RECHAZADO', SUSPENDIDO: 'SUSPENDIDO' } as const;
export type EstadoUsuario = (typeof EstadoUsuario)[keyof typeof EstadoUsuario];

export const ClaseLicencia = { A: 'A', B: 'B', C: 'C', D: 'D' } as const;
export type ClaseLicencia = (typeof ClaseLicencia)[keyof typeof ClaseLicencia];

export const EstadoProyecto = {
  BORRADOR: 'BORRADOR',
  EN_DESARROLLO: 'EN_DESARROLLO',
  LISTO_PARA_DECLARAR: 'LISTO_PARA_DECLARAR',
  DECLARADO: 'DECLARADO',
} as const;
export type EstadoProyecto = (typeof EstadoProyecto)[keyof typeof EstadoProyecto];

export const CategoriaDocumento = {
  PLANO: 'PLANO',
  MEMORIA_CALCULO: 'MEMORIA_CALCULO',
  FOTOGRAFIA: 'FOTOGRAFIA',
  TABLA: 'TABLA',
  CERTIFICADO: 'CERTIFICADO',
  OTRO: 'OTRO',
} as const;
export type CategoriaDocumento = (typeof CategoriaDocumento)[keyof typeof CategoriaDocumento];

export const EsquemaRevision = { LETRAS: 'LETRAS', NUMEROS: 'NUMEROS' } as const;
export type EsquemaRevision = (typeof EsquemaRevision)[keyof typeof EsquemaRevision];

export const CategoriaNormativa = {
  PLIEGO_RIC: 'PLIEGO_RIC',
  REGLAMENTO: 'REGLAMENTO',
  NORMA: 'NORMA',
  INSTRUCTIVO: 'INSTRUCTIVO',
  GUIA: 'GUIA',
} as const;
export type CategoriaNormativa = (typeof CategoriaNormativa)[keyof typeof CategoriaNormativa];

export const TipoMaterial = { VIDEO: 'VIDEO', DOCUMENTO: 'DOCUMENTO', ENLACE: 'ENLACE' } as const;
export type TipoMaterial = (typeof TipoMaterial)[keyof typeof TipoMaterial];

export const CategoriaMaterial = { TUTORIAL: 'TUTORIAL', NORMATIVA: 'NORMATIVA', WEBINAR: 'WEBINAR', CASO_PRACTICO: 'CASO_PRACTICO' } as const;
export type CategoriaMaterial = (typeof CategoriaMaterial)[keyof typeof CategoriaMaterial];

export const EstadoSolicitudExtension = { PENDIENTE: 'PENDIENTE', APROBADA: 'APROBADA', RECHAZADA: 'RECHAZADA' } as const;
export type EstadoSolicitudExtension = (typeof EstadoSolicitudExtension)[keyof typeof EstadoSolicitudExtension];

export const TipoNotificacion = { INFO: 'INFO', EXITO: 'EXITO', ALERTA: 'ALERTA' } as const;
export type TipoNotificacion = (typeof TipoNotificacion)[keyof typeof TipoNotificacion];
