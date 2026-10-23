/**
 * Seed de la base de datos.
 *
 * - Admin inicial: SEED_ADMIN_NOMBRE, SEED_ADMIN_RUT, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD (obligatorias).
 * - Catálogo de ejemplo (tipos TE, normativa, material, extensiones), marcado como referencial.
 * - Datos demo (usuarios, proyectos, revisiones, solicitudes) si SEED_DEMO=true; contraseña: SEED_DEMO_PASSWORD.
 *
 * Es idempotente: el admin se actualiza; el catálogo y los datos demo se omiten si ya existen.
 * Uso: npm run db:seed   (o `npm run db:reset` para recrear la base completa)
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { normalizarRut, passwordAceptable, sanearNombreArchivo, validarRut } from '@electricos/shared';
import { asegurarBucket, crearClienteS3 } from '../src/storage/s3';
import { extensiones, material, normativa, tiposTE } from './seed-data/catalogo';
import { proyectosDemo, solicitudesDemo, usuariosDemo } from './seed-data/demo';

const prisma = new PrismaClient();
const VERSION_CONSENTIMIENTO = '2026-10';
const DIR_ARCHIVOS = join(__dirname, 'seed-files');

function requerida(nombre: string): string {
  const v = process.env[nombre]?.trim();
  if (!v) throw new Error(`Falta la variable de entorno ${nombre} (ver apps/api/.env.example)`);
  return v;
}

const s3 = crearClienteS3({
  endpoint: process.env.S3_ENDPOINT || undefined,
  region: process.env.S3_REGION ?? 'us-east-1',
  accessKeyId: requerida('S3_ACCESS_KEY'),
  secretAccessKey: requerida('S3_SECRET_KEY'),
  forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? 'true') === 'true',
});
const BUCKET = requerida('S3_BUCKET');

const MIME: Record<string, string> = { pdf: 'application/pdf', png: 'image/png' };

/** Sube un archivo de prisma/seed-files al bucket y devuelve sus metadatos. */
async function subir(prefijo: string, archivo: string, nombreVisible = archivo) {
  const contenido = readFileSync(join(DIR_ARCHIVOS, archivo));
  const ext = archivo.split('.').pop()!;
  const mimeType = MIME[ext] ?? 'application/octet-stream';
  const nombreOriginal = sanearNombreArchivo(nombreVisible);
  const objectKey = `${prefijo}/seed/${randomUUID()}-${nombreOriginal}`;
  const sha256 = createHash('sha256').update(contenido).digest('hex');
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: objectKey, Body: contenido, ContentType: mimeType, Metadata: { sha256 } }));
  return { objectKey, nombreOriginal, mimeType, tamano: contenido.length, sha256 };
}

const haceDias = (dias: number) => new Date(Date.now() - dias * 86_400_000);

// ─────────────── Admin ───────────────

async function seedAdmin() {
  const rut = requerida('SEED_ADMIN_RUT');
  const password = requerida('SEED_ADMIN_PASSWORD');
  if (!validarRut(rut)) throw new Error('SEED_ADMIN_RUT no es un RUT válido');
  if (!passwordAceptable(password)) throw new Error('SEED_ADMIN_PASSWORD es débil: usa 8+ caracteres con mayúsculas, minúsculas, números y símbolos');

  const email = requerida('SEED_ADMIN_EMAIL').toLowerCase();
  const datos = {
    nombreCompleto: requerida('SEED_ADMIN_NOMBRE'),
    rut: normalizarRut(rut),
    passwordHash: await argon2.hash(password),
    rol: 'ADMIN' as const,
    estado: 'APROBADO' as const,
  };
  const admin = await prisma.user.upsert({
    where: { email },
    update: datos,
    create: { ...datos, email, consentimientoAt: new Date(), consentimientoVersion: VERSION_CONSENTIMIENTO, estadoActualizadoAt: new Date() },
  });
  console.log(`✔ Admin: ${admin.email}`);
  return admin;
}

// ─────────────── Catálogo ───────────────

async function seedCatalogo() {
  if ((await prisma.tipoTE.count()) > 0) {
    console.log('• Catálogo ya existente: se omite');
    return;
  }

  // Normativa (primero, para enlazarla con los tipos TE y la guía)
  const normativaPorNumero = new Map<string, string>();
  for (const n of normativa) {
    const { sha256: _sha, ...archivo } = await subir('normativa', n.archivo);
    const doc = await prisma.documentoNormativo.create({
      data: {
        numero: n.numero,
        titulo: n.titulo,
        descripcion: n.descripcion,
        categoria: n.categoria,
        version: n.version,
        fecha: new Date(n.fecha),
        referencial: true,
        ...archivo,
      },
    });
    normativaPorNumero.set(n.numero, doc.id);
  }
  const ricId = (num: string) => normativaPorNumero.get(`RIC N°${num}`)!;

  for (const [orden, t] of tiposTE.entries()) {
    const extras = normativa.filter((n) => n.tiposTE?.includes(t.codigo)).map((n) => normativaPorNumero.get(n.numero)!);
    await prisma.tipoTE.create({
      data: {
        codigo: t.codigo,
        nombre: t.nombre,
        descripcion: t.descripcion,
        activo: t.activo,
        orden,
        referencial: true,
        documentosRequeridos: { create: t.documentos.map((d, i) => ({ ...d, orden: i })) },
        requisitos: { create: t.requisitos.map((texto, i) => ({ texto, orden: i })) },
        guia: {
          create: t.guia.map((p, i) => ({
            orden: i + 1,
            titulo: p.titulo,
            descripcion: p.descripcion,
            normativa: { connect: (p.ric ?? []).map((r) => ({ id: ricId(r) })) },
          })),
        },
        normativa: { connect: [...t.ric.map((r) => ({ id: ricId(r) })), ...extras.map((id) => ({ id }))] },
      },
    });
  }
  console.log(`✔ Tipos TE: ${tiposTE.length} · Normativa: ${normativa.length}`);

  for (const m of material) {
    const adjuntos = [];
    for (const a of m.adjuntos) {
      const { sha256: _sha, ...archivo } = await subir('material', a.archivo, a.nombre);
      adjuntos.push(archivo);
    }
    await prisma.materialApoyo.create({
      data: {
        titulo: m.titulo,
        descripcion: m.descripcion,
        tipo: 'VIDEO',
        categoria: m.categoria,
        duracionSeg: m.duracionSeg,
        autor: m.autor,
        publicadoAt: new Date(m.publicadoAt),
        tiposTE: { connect: m.tiposTE.map((codigo) => ({ codigo })) },
        adjuntos: { create: adjuntos },
      },
    });
  }
  console.log(`✔ Material de apoyo: ${material.length}`);

  for (const [orden, e] of extensiones.entries()) {
    await prisma.extension.upsert({ where: { slug: e.slug }, update: {}, create: { ...e, orden } });
  }
  console.log(`✔ Extensiones: ${extensiones.length}`);
}

// ─────────────── Demo ───────────────

async function seedDemo(adminId: string) {
  if ((process.env.SEED_DEMO ?? 'true') !== 'true') {
    console.log('• SEED_DEMO=false: se omiten los datos de demostración');
    return;
  }
  if ((await prisma.proyecto.count()) > 0) {
    console.log('• Datos demo ya existentes: se omiten');
    return;
  }
  const password = requerida('SEED_DEMO_PASSWORD');
  if (!passwordAceptable(password)) throw new Error('SEED_DEMO_PASSWORD es débil');
  const passwordHash = await argon2.hash(password);

  const usuarios = new Map<string, string>();
  for (const u of usuariosDemo) {
    const certificado = await subir('certificados', u.certificado, `certificado-${u.clave}.pdf`);
    const resuelto = u.estado !== 'PENDIENTE';
    const creado = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        nombreCompleto: u.nombreCompleto,
        rut: normalizarRut(u.rut),
        email: u.email,
        passwordHash,
        estado: u.estado,
        licenciaSecNumero: u.licencia.numero,
        licenciaSecClase: u.licencia.clase,
        telefono: u.telefono,
        comuna: u.comuna,
        motivoRechazo: u.motivoRechazo,
        estadoActualizadoAt: resuelto ? haceDias(30) : null,
        consentimientoAt: haceDias(60),
        consentimientoVersion: VERSION_CONSENTIMIENTO,
        createdAt: u.estado === 'PENDIENTE' ? haceDias(1) : haceDias(90),
        certificados: {
          create: { ...certificado, validadoPorId: u.estado === 'APROBADO' ? adminId : null, validadoAt: u.estado === 'APROBADO' ? haceDias(30) : null },
        },
      },
    });
    usuarios.set(u.clave, creado.id);
  }
  console.log(`✔ Usuarios demo: ${usuariosDemo.length}`);

  const tipos = await prisma.tipoTE.findMany({ include: { documentosRequeridos: true, requisitos: { orderBy: { orden: 'asc' } } } });
  const anio = new Date().getFullYear();

  for (const [i, p] of proyectosDemo.entries()) {
    const tipo = tipos.find((t) => t.codigo === p.tipoTE)!;
    const propietarioId = usuarios.get(p.propietario)!;
    const masAntigua = Math.max(0, ...p.documentos.flatMap((d) => d.revisiones.map((r) => r.hace)));
    const proyecto = await prisma.proyecto.create({
      data: {
        codigo: `PRY-${anio}-${String(i + 1).padStart(3, '0')}`,
        propietarioId,
        tipoTEId: tipo.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        clienteNombre: p.cliente.nombre,
        clienteRut: p.cliente.rut ? normalizarRut(p.cliente.rut) : null,
        clienteEmail: p.cliente.email,
        clienteTelefono: p.cliente.telefono,
        direccion: p.direccion,
        comuna: p.comuna,
        region: p.region,
        potenciaKw: p.potenciaKw,
        estado: p.estado,
        folioSec: p.folioSec,
        fechaDeclaracion: p.estado === 'DECLARADO' ? haceDias(80) : null,
        createdAt: haceDias(masAntigua + 2),
        requisitos: { create: p.requisitos.map((idx) => ({ requisitoId: tipo.requisitos[idx]!.id })) },
      },
    });

    for (const d of p.documentos) {
      const requerido = tipo.documentosRequeridos.find((r) => r.nombre === d.requerido);
      const documento = await prisma.documento.create({
        data: {
          proyectoId: proyecto.id,
          nombre: d.nombre,
          categoria: d.categoria,
          esquemaRevision: d.esquema,
          documentoRequeridoId: requerido?.id,
          createdAt: haceDias(d.revisiones[0]!.hace),
        },
      });
      for (const [j, r] of d.revisiones.entries()) {
        const archivo = await subir(`proyectos/${proyecto.id}`, r.archivo, r.nombre);
        await prisma.revisionDocumento.create({
          data: {
            documentoId: documento.id,
            codigo: r.codigo,
            comentario: r.comentario,
            subidoPorId: propietarioId,
            esVigente: j === d.revisiones.length - 1,
            createdAt: haceDias(r.hace),
            ...archivo,
          },
        });
      }
    }
  }
  console.log(`✔ Proyectos demo: ${proyectosDemo.length}`);

  const exts = await prisma.extension.findMany();
  for (const s of solicitudesDemo) {
    const resuelta = s.estado !== 'PENDIENTE';
    await prisma.solicitudExtension.create({
      data: {
        usuarioId: usuarios.get(s.usuario)!,
        extensionId: exts.find((e) => e.slug === s.extension)!.id,
        estado: s.estado,
        comentario: s.comentario,
        motivo: s.motivo,
        createdAt: haceDias(s.hace),
        resueltoPorId: resuelta ? adminId : null,
        resueltoAt: resuelta ? haceDias(s.hace - 1) : null,
      },
    });
  }
  console.log(`✔ Solicitudes de extensiones: ${solicitudesDemo.length}`);

  await prisma.notificacion.createMany({
    data: [
      {
        usuarioId: usuarios.get('juan')!,
        tipo: 'EXITO',
        titulo: 'Extensión activada',
        mensaje: 'La extensión "Cálculo de caída de tensión" fue aprobada.',
        enlace: '/extensiones',
        leida: true,
        createdAt: haceDias(199),
      },
      {
        usuarioId: adminId,
        tipo: 'ALERTA',
        titulo: 'Usuarios pendientes de validación',
        mensaje: 'Hay 2 cuentas nuevas esperando revisión de certificado SEC.',
        enlace: '/admin/usuarios?estado=PENDIENTE',
      },
    ],
  });
}

async function main() {
  const creado = await asegurarBucket(s3, BUCKET);
  if (creado) console.log(`✔ Bucket "${BUCKET}" creado`);
  const admin = await seedAdmin();
  await seedCatalogo();
  await seedDemo(admin.id);
  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error('✖ Error en el seed:', e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
