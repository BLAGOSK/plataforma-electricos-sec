import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileSearch, PlayCircle } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { useTiposTE } from '@/hooks/useTiposTE';
import { aprendizajeService } from '@/services/aprendizajeService';
import { archivoDisponible, descargarArchivo } from '@/services/archivos';
import { useVersion } from '@/services/eventos';
import { formatBytes, formatFecha } from '@/utils/format';
import { FilePreview } from '@/components/FilePreview';
import { PageHeader } from '@/components/PageHeader';
import { ReferencialAviso, ReferencialBadge } from '@/components/ReferencialAviso';
import { Badge, Button, ButtonLink, Card, CardBody, CardHeader, Cargando, EmptyState } from '@/components/ui';
import { TETags } from '../components/TETags';
import { formatDuracion, infoCategoriaNormativa } from '../constantes';

export function PliegoDetallePage() {
  const { id = '' } = useParams();
  const { porId } = useTiposTE();
  const version = useVersion('contenidos');

  const { data, loading, error } = useAsync(async () => {
    const doc = await aprendizajeService.obtenerDocumento(id);
    const videos = await aprendizajeService.listarVideos();
    return { doc, videos: videos.filter((v) => v.tiposTE.some((t) => doc.tiposTE.includes(t))).slice(0, 3) };
  }, [id, version]);

  if (loading && !data) return <Cargando />;
  if (error || !data) {
    return (
      <Card>
        <EmptyState icon={FileSearch} titulo="Documento no encontrado" accion={<ButtonLink to="/aprendizaje">Volver a la biblioteca</ButtonLink>} />
      </Card>
    );
  }

  const { doc, videos } = data;
  const cat = infoCategoriaNormativa[doc.categoria];

  return (
    <div>
      <Link to="/aprendizaje" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Biblioteca normativa
      </Link>
      <PageHeader
        titulo={`${doc.codigo} · ${doc.titulo}`}
        descripcion={doc.descripcion}
        icon={cat.icon}
        meta={
          <>
            <Badge>{cat.label}</Badge>
            <Badge color="gray">{doc.version}</Badge>
            {doc.referencial && <ReferencialBadge />}
          </>
        }
        acciones={
          <Button icon={Download} onClick={() => descargarArchivo(doc.archivo)} disabled={!archivoDisponible(doc.archivo)}>
            Descargar
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardBody>
            <FilePreview archivo={doc.archivo} className="h-[70vh]" />
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Información" />
            <CardBody>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Versión</dt>
                  <dd className="text-slate-900">{doc.version}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Fecha de publicación</dt>
                  <dd className="text-slate-900">{formatFecha(doc.fecha)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Archivo</dt>
                  <dd className="truncate text-slate-900">
                    {doc.archivo.nombre} · {formatBytes(doc.archivo.tamano)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Actualizado en la plataforma</dt>
                  <dd className="text-slate-900">{formatFecha(doc.fechaActualizacion)}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs text-slate-500">Tipos TE relacionados</dt>
                  <dd>
                    <TETags ids={doc.tiposTE} porId={porId} enlazarA="/aprendizaje" />
                    {doc.tiposTE.length === 0 && <span className="text-slate-400">—</span>}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {videos.length > 0 && (
            <Card>
              <CardHeader title="Videos relacionados" />
              <ul className="divide-y divide-slate-100">
                {videos.map((v) => (
                  <li key={v.id}>
                    <Link to={`/aprendizaje/videos/${v.id}`} className="flex items-start gap-3 px-5 py-3 text-sm hover:bg-slate-50">
                      <PlayCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      <span className="flex-1 text-slate-700">{v.titulo}</span>
                      <span className="shrink-0 text-xs text-slate-400">{formatDuracion(v.duracionSeg)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {doc.referencial && <ReferencialAviso />}
        </div>
      </div>
    </div>
  );
}
