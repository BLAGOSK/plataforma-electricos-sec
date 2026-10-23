-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ELECTRICO', 'ADMIN', 'ASESOR');

-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'SUSPENDIDO');

-- CreateEnum
CREATE TYPE "ClaseLicencia" AS ENUM ('A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "EstadoProyecto" AS ENUM ('BORRADOR', 'EN_DESARROLLO', 'LISTO_PARA_DECLARAR', 'DECLARADO');

-- CreateEnum
CREATE TYPE "CategoriaDocumento" AS ENUM ('PLANO', 'MEMORIA_CALCULO', 'FOTOGRAFIA', 'TABLA', 'CERTIFICADO', 'OTRO');

-- CreateEnum
CREATE TYPE "EsquemaRevision" AS ENUM ('LETRAS', 'NUMEROS');

-- CreateEnum
CREATE TYPE "CategoriaNormativa" AS ENUM ('PLIEGO_RIC', 'REGLAMENTO', 'NORMA', 'INSTRUCTIVO', 'GUIA');

-- CreateEnum
CREATE TYPE "TipoMaterial" AS ENUM ('VIDEO', 'DOCUMENTO', 'ENLACE');

-- CreateEnum
CREATE TYPE "CategoriaMaterial" AS ENUM ('TUTORIAL', 'NORMATIVA', 'WEBINAR', 'CASO_PRACTICO');

-- CreateEnum
CREATE TYPE "EstadoSolicitudExtension" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('INFO', 'EXITO', 'ALERTA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'ELECTRICO',
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'PENDIENTE',
    "licenciaSecNumero" TEXT,
    "licenciaSecClase" "ClaseLicencia",
    "telefono" TEXT,
    "comuna" TEXT,
    "motivoRechazo" TEXT,
    "estadoActualizadoAt" TIMESTAMP(3),
    "preferenciasNotificacion" JSONB,
    "consentimientoAt" TIMESTAMP(3) NOT NULL,
    "consentimientoVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificadoSec" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "nombreOriginal" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "cargadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validadoPorId" TEXT,
    "validadoAt" TIMESTAMP(3),

    CONSTRAINT "CertificadoSec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "familia" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "enlace" TEXT,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoTE" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "referencial" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoTE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoRequerido" (
    "id" TEXT NOT NULL,
    "tipoTEId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" "CategoriaDocumento" NOT NULL,
    "obligatorio" BOOLEAN NOT NULL DEFAULT true,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DocumentoRequerido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuiaDeclaracion" (
    "id" TEXT NOT NULL,
    "tipoTEId" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "GuiaDeclaracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequisitoTE" (
    "id" TEXT NOT NULL,
    "tipoTEId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RequisitoTE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proyecto" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "propietarioId" TEXT NOT NULL,
    "tipoTEId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "clienteNombre" TEXT NOT NULL,
    "clienteRut" TEXT,
    "clienteEmail" TEXT,
    "clienteTelefono" TEXT,
    "direccion" TEXT NOT NULL,
    "comuna" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "potenciaKw" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoProyecto" NOT NULL DEFAULT 'BORRADOR',
    "folioSec" TEXT,
    "fechaDeclaracion" TIMESTAMP(3),
    "eliminadoAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProyectoRequisito" (
    "proyectoId" TEXT NOT NULL,
    "requisitoId" TEXT NOT NULL,
    "marcadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProyectoRequisito_pkey" PRIMARY KEY ("proyectoId","requisitoId")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "proyectoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" "CategoriaDocumento" NOT NULL,
    "documentoRequeridoId" TEXT,
    "esquemaRevision" "EsquemaRevision" NOT NULL DEFAULT 'LETRAS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionDocumento" (
    "id" TEXT NOT NULL,
    "documentoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "comentario" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "nombreOriginal" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "subidoPorId" TEXT NOT NULL,
    "esVigente" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevisionDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoNormativo" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" "CategoriaNormativa" NOT NULL,
    "version" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "objectKey" TEXT NOT NULL,
    "nombreOriginal" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "referencial" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentoNormativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialApoyo" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" "TipoMaterial" NOT NULL,
    "categoria" "CategoriaMaterial" NOT NULL,
    "url" TEXT,
    "objectKey" TEXT,
    "nombreOriginal" TEXT,
    "mimeType" TEXT,
    "tamano" INTEGER,
    "duracionSeg" INTEGER,
    "autor" TEXT,
    "publicadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialApoyo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivoMaterial" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "nombreOriginal" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,

    CONSTRAINT "ArchivoMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extension" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcionCorta" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "caracteristicas" TEXT[],
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Extension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudExtension" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "extensionId" TEXT NOT NULL,
    "estado" "EstadoSolicitudExtension" NOT NULL DEFAULT 'PENDIENTE',
    "comentario" TEXT,
    "motivo" TEXT,
    "resueltoPorId" TEXT,
    "resueltoAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolicitudExtension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "detalle" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocumentoNormativoToTipoTE" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DocumentoNormativoToTipoTE_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DocumentoNormativoToGuiaDeclaracion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DocumentoNormativoToGuiaDeclaracion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MaterialApoyoToTipoTE" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MaterialApoyoToTipoTE_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_rut_key" ON "User"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_estado_rol_idx" ON "User"("estado", "rol");

-- CreateIndex
CREATE INDEX "CertificadoSec_usuarioId_idx" ON "CertificadoSec"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_usuarioId_idx" ON "RefreshToken"("usuarioId");

-- CreateIndex
CREATE INDEX "RefreshToken_familia_idx" ON "RefreshToken"("familia");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_usuarioId_idx" ON "PasswordResetToken"("usuarioId");

-- CreateIndex
CREATE INDEX "Notificacion_usuarioId_leida_idx" ON "Notificacion"("usuarioId", "leida");

-- CreateIndex
CREATE UNIQUE INDEX "TipoTE_codigo_key" ON "TipoTE"("codigo");

-- CreateIndex
CREATE INDEX "DocumentoRequerido_tipoTEId_idx" ON "DocumentoRequerido"("tipoTEId");

-- CreateIndex
CREATE INDEX "GuiaDeclaracion_tipoTEId_idx" ON "GuiaDeclaracion"("tipoTEId");

-- CreateIndex
CREATE INDEX "RequisitoTE_tipoTEId_idx" ON "RequisitoTE"("tipoTEId");

-- CreateIndex
CREATE UNIQUE INDEX "Proyecto_codigo_key" ON "Proyecto"("codigo");

-- CreateIndex
CREATE INDEX "Proyecto_propietarioId_estado_idx" ON "Proyecto"("propietarioId", "estado");

-- CreateIndex
CREATE INDEX "Proyecto_tipoTEId_idx" ON "Proyecto"("tipoTEId");

-- CreateIndex
CREATE INDEX "Documento_proyectoId_idx" ON "Documento"("proyectoId");

-- CreateIndex
CREATE INDEX "RevisionDocumento_documentoId_idx" ON "RevisionDocumento"("documentoId");

-- CreateIndex
CREATE UNIQUE INDEX "RevisionDocumento_documentoId_codigo_key" ON "RevisionDocumento"("documentoId", "codigo");

-- CreateIndex
CREATE INDEX "DocumentoNormativo_categoria_idx" ON "DocumentoNormativo"("categoria");

-- CreateIndex
CREATE INDEX "ArchivoMaterial_materialId_idx" ON "ArchivoMaterial"("materialId");

-- CreateIndex
CREATE UNIQUE INDEX "Extension_slug_key" ON "Extension"("slug");

-- CreateIndex
CREATE INDEX "SolicitudExtension_usuarioId_extensionId_idx" ON "SolicitudExtension"("usuarioId", "extensionId");

-- CreateIndex
CREATE INDEX "SolicitudExtension_estado_idx" ON "SolicitudExtension"("estado");

-- CreateIndex
CREATE INDEX "AuditLog_entidad_entidadId_idx" ON "AuditLog"("entidad", "entidadId");

-- CreateIndex
CREATE INDEX "AuditLog_usuarioId_idx" ON "AuditLog"("usuarioId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "_DocumentoNormativoToTipoTE_B_index" ON "_DocumentoNormativoToTipoTE"("B");

-- CreateIndex
CREATE INDEX "_DocumentoNormativoToGuiaDeclaracion_B_index" ON "_DocumentoNormativoToGuiaDeclaracion"("B");

-- CreateIndex
CREATE INDEX "_MaterialApoyoToTipoTE_B_index" ON "_MaterialApoyoToTipoTE"("B");

-- AddForeignKey
ALTER TABLE "CertificadoSec" ADD CONSTRAINT "CertificadoSec_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificadoSec" ADD CONSTRAINT "CertificadoSec_validadoPorId_fkey" FOREIGN KEY ("validadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoRequerido" ADD CONSTRAINT "DocumentoRequerido_tipoTEId_fkey" FOREIGN KEY ("tipoTEId") REFERENCES "TipoTE"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaDeclaracion" ADD CONSTRAINT "GuiaDeclaracion_tipoTEId_fkey" FOREIGN KEY ("tipoTEId") REFERENCES "TipoTE"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequisitoTE" ADD CONSTRAINT "RequisitoTE_tipoTEId_fkey" FOREIGN KEY ("tipoTEId") REFERENCES "TipoTE"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proyecto" ADD CONSTRAINT "Proyecto_propietarioId_fkey" FOREIGN KEY ("propietarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proyecto" ADD CONSTRAINT "Proyecto_tipoTEId_fkey" FOREIGN KEY ("tipoTEId") REFERENCES "TipoTE"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProyectoRequisito" ADD CONSTRAINT "ProyectoRequisito_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProyectoRequisito" ADD CONSTRAINT "ProyectoRequisito_requisitoId_fkey" FOREIGN KEY ("requisitoId") REFERENCES "RequisitoTE"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_documentoRequeridoId_fkey" FOREIGN KEY ("documentoRequeridoId") REFERENCES "DocumentoRequerido"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionDocumento" ADD CONSTRAINT "RevisionDocumento_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "Documento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionDocumento" ADD CONSTRAINT "RevisionDocumento_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivoMaterial" ADD CONSTRAINT "ArchivoMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "MaterialApoyo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudExtension" ADD CONSTRAINT "SolicitudExtension_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudExtension" ADD CONSTRAINT "SolicitudExtension_extensionId_fkey" FOREIGN KEY ("extensionId") REFERENCES "Extension"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudExtension" ADD CONSTRAINT "SolicitudExtension_resueltoPorId_fkey" FOREIGN KEY ("resueltoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentoNormativoToTipoTE" ADD CONSTRAINT "_DocumentoNormativoToTipoTE_A_fkey" FOREIGN KEY ("A") REFERENCES "DocumentoNormativo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentoNormativoToTipoTE" ADD CONSTRAINT "_DocumentoNormativoToTipoTE_B_fkey" FOREIGN KEY ("B") REFERENCES "TipoTE"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentoNormativoToGuiaDeclaracion" ADD CONSTRAINT "_DocumentoNormativoToGuiaDeclaracion_A_fkey" FOREIGN KEY ("A") REFERENCES "DocumentoNormativo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentoNormativoToGuiaDeclaracion" ADD CONSTRAINT "_DocumentoNormativoToGuiaDeclaracion_B_fkey" FOREIGN KEY ("B") REFERENCES "GuiaDeclaracion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MaterialApoyoToTipoTE" ADD CONSTRAINT "_MaterialApoyoToTipoTE_A_fkey" FOREIGN KEY ("A") REFERENCES "MaterialApoyo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MaterialApoyoToTipoTE" ADD CONSTRAINT "_MaterialApoyoToTipoTE_B_fkey" FOREIGN KEY ("B") REFERENCES "TipoTE"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Una sola revisión vigente por documento (índice único parcial; Prisma no lo modela de forma nativa)
CREATE UNIQUE INDEX "RevisionDocumento_documentoId_vigente_key" ON "RevisionDocumento"("documentoId") WHERE "esVigente" = true;
