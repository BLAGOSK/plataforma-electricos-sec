import { CreateBucketCommand, HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';

export interface ConfigS3 {
  endpoint?: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
}

/** Cliente S3 compatible con AWS, MinIO y otros proveedores. Lo usan StorageService y el seed. */
export function crearClienteS3(cfg: ConfigS3): S3Client {
  return new S3Client({
    endpoint: cfg.endpoint,
    region: cfg.region,
    forcePathStyle: cfg.forcePathStyle,
    credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
  });
}

export async function asegurarBucket(client: S3Client, bucket: string): Promise<boolean> {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    return false;
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: bucket }));
    return true;
  }
}
