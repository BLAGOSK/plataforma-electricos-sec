import { Link, useParams } from 'react-router-dom';
import { CalendarDays, Clock, User, VideoOff } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { useTiposTE } from '@/hooks/useTiposTE';
import { aprendizajeService } from '@/services/aprendizajeService';
import { useVersion } from '@/services/eventos';
import { formatFecha } from '@/utils/format';
import { ArchivoItem } from '@/components/FilePreview';
import { Badge, ButtonLink, Card, CardBody, CardHeader, Cargando, EmptyState } from '@/components/ui';
import { TETags } from '../components/TETags';
import { VideoPlayer } from '../components/VideoPlayer';
import { VideoThumb } from '../components/VideoThumb';
import { etiquetaCategoriaVideo, formatDuracion } from '../constantes';

export function VideoDetallePage() {
  const { id = '' } = useParams();
  const { porId } = useTiposTE();
  const version = useVersion('contenidos');

  const { data, loading, error } = useAsync(async () => {
    const video = await aprendizajeService.obtenerVideo(id);
    const todos = await aprendizajeService.listarVideos();
    const relacionados = todos.filter((v) => v.id !== id && v.tiposTE.some((t) => video.tiposTE.includes(t))).slice(0, 4);
    return { video, relacionados };
  }, [id, version]);

  if (loading && !data) return <Cargando />;
  if (error || !data) {
    return (
      <Card>
        <EmptyState icon={VideoOff} titulo="Video no encontrado" accion={<ButtonLink to="/aprendizaje/videos">Volver a videos</ButtonLink>} />
      </Card>
    );
  }

  const { video, relacionados } = data;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        <VideoPlayer video={video} />
        <div>
          <Badge color="brand">{etiquetaCategoriaVideo[video.categoria]}</Badge>
          <h1 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">{video.titulo}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <User className="h-4 w-4" /> {video.autor}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" /> {formatFecha(video.fechaPublicacion)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" /> {formatDuracion(video.duracionSeg)}
            </span>
          </div>
        </div>
        <Card>
          <CardBody className="space-y-4">
            <p className="whitespace-pre-line text-sm text-slate-700">{video.descripcion}</p>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Tipos TE relacionados</p>
              <TETags ids={video.tiposTE} porId={porId} enlazarA="/aprendizaje/videos" />
            </div>
          </CardBody>
        </Card>
        {video.materiales.length > 0 && (
          <Card>
            <CardHeader title="Material de apoyo" description="Archivos descargables asociados a este video" />
            <CardBody className="space-y-2">
              {video.materiales.map((m) => (
                <ArchivoItem key={m.id} archivo={m} onDescargar />
              ))}
            </CardBody>
          </Card>
        )}
      </div>

      <aside>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Videos relacionados</h2>
        {relacionados.length === 0 ? (
          <p className="text-sm text-slate-500">No hay videos relacionados.</p>
        ) : (
          <ul className="space-y-3">
            {relacionados.map((v) => (
              <li key={v.id}>
                <Link to={`/aprendizaje/videos/${v.id}`} className="group flex gap-3">
                  <VideoThumb id={v.id} titulo="" duracionSeg={v.duracionSeg} className="w-32 shrink-0 rounded-lg [&>span:nth-of-type(1)]:h-8 [&>span:nth-of-type(1)]:w-8" />
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-sm font-medium text-slate-900 group-hover:text-brand-800">{v.titulo}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{v.autor}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
