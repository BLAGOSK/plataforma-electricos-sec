import { createHash, randomUUID } from 'node:crypto';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { sanearNombreArchivo } from '@electricos/shared';
import { ENV } from '../config/config.module';
import type { Env } from '../config/env';
import { asegurarBucket, crearClienteS3 } from './s3';

export interface ArchivoGuardado {
  objectKey: string;
  nombreOriginal: string;
  mimeType: string;
  tamano: number;
  sha256: string;
}

export interface UrlDescarga {
  url: string;
  expiraEn: string;
}

/**
 * Almacenamiento de archivos compatible con S3. El bucket es privado:
 * los archivos solo se entregan mediante URLs prefirmadas de corta duración.
 */
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  /** Firma URLs con el endpoint público (el navegador no ve el hostname interno de Docker). */
  private readonly clientePublico: S3Client;
  readonly bucket: string;

  constructor(@Inject(ENV) private readonly env: Env) {
    const base = {
      region: env.S3_REGION,
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_SECRET_KEY,
      forcePathStyle: env.S3_FORCE_PATH_STYLE,
    };
    this.client = crearClienteS3({ ...base, endpoint: env.S3_ENDPOINT });
    this.clientePublico = crearClienteS3({ ...base, endpoint: env.S3_PUBLIC_ENDPOINT ?? env.S3_ENDPOINT });
    this.bucket = env.S3_BUCKET;
  }

  async onModuleInit() {
    if (!this.env.S3_CREAR_BUCKET) return;
    try {
      if (await asegurarBucket(this.client, this.bucket)) this.logger.log(`Bucket "${this.bucket}" creado`);
    } catch (e) {
      this.logger.warn(`No se pudo verificar el bucket "${this.bucket}": ${(e as Error).message}`);
    }
  }

  /** Genera una clave única: <prefijo>/<año>/<uuid>-<nombre-saneado> */
  construirKey(prefijo: string, nombreOriginal: string): string {
    const anio = new Date().getFullYear();
    return `${prefijo.replace(/\/+$/, '')}/${anio}/${randomUUID()}-${sanearNombreArchivo(nombreOriginal)}`;
  }

  async guardar(prefijo: string, contenido: Buffer, nombreOriginal: string, mimeType: string): Promise<ArchivoGuardado> {
    const objectKey = this.construirKey(prefijo, nombreOriginal);
    const sha256 = createHash('sha256').update(contenido).digest('hex');
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: contenido,
        ContentType: mimeType,
        Metadata: { sha256 },
      }),
    );
    return { objectKey, nombreOriginal: sanearNombreArchivo(nombreOriginal), mimeType, tamano: contenido.length, sha256 };
  }

  async urlDescarga(objectKey: string, nombreArchivo: string, inline = false): Promise<UrlDescarga> {
    const ttl = this.env.PRESIGN_TTL_SEG;
    const nombre = encodeURIComponent(sanearNombreArchivo(nombreArchivo));
    const url = await getSignedUrl(
      this.clientePublico,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        ResponseContentDisposition: `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${nombre}`,
      }),
      { expiresIn: ttl },
    );
    return { url, expiraEn: new Date(Date.now() + ttl * 1000).toISOString() };
  }

  async eliminar(objectKey: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: objectKey }));
  }

  async verificar(): Promise<void> {
    await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
  }
}
