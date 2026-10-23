import { Link } from 'react-router-dom';
import { FileDown, VideoOff } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { useTiposTE } from '@/hooks/useTiposTE';
import { aprendizajeService } from '@/services/aprendizajeService';
import { useVersion } from '@/services/eventos';
import { formatFecha } from '@/utils/format';
import { Card, Cargando, EmptyState } from '@/components/ui';
import { AprendizajeHeader } from '../components/AprendizajeHeader';
import { FiltrosAprendizaje } from '../components/FiltrosAprendizaje';
import { TETags } from '../components/TETags';
import { VideoThumb } from '../components/VideoThumb';
import { categoriasVideo, etiquetaCategoriaVideo } from '../constantes';
import { useFiltrosUrl } from '../useFiltrosUrl';

export function VideosPage() {
  const f = useFiltrosUrl();
  const { tipos, porId } = useTiposTE();
  const version = useVersion('contenidos');

  const { data: videos, loading } = useAsync(
    () => aprendizajeService.listarVideos({ q: f.q, tipoTEId: f.tipoTEId || undefined, categoria: f.categoria || undefined }),
    [f.q, f.tipoTEId, f.categoria, version],
  );

  return (
    <div>
      <AprendizajeHeader />
      <FiltrosAprendizaje
        busqueda={f.busqueda}
        onBusqueda={f.setBusqueda}
        tipoTEId={f.tipoTEId}
        onTipoTE={f.setTipoTE}
        categoria={f.categoria}
        onCategoria={f.setCategoria}
        categorias={categoriasVideo}
        tipos={tipos}
        onLimpiar={f.limpiar}
        placeholder="Buscar videos por título, tema o autor…"
      />

      {loading && !videos ? (
        <Cargando />
      ) : !videos?.length ? (
        <Card>
          <EmptyState icon={VideoOff} titulo="No se encontraron videos" descripcion="Prueba con otros filtros o términos de búsqueda." />
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((v) => (
            <Link key={v.id} to={`/aprendizaje/videos/${v.id}`} className="group">
              <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
                <VideoThumb id={v.id} titulo={v.titulo} duracionSeg={v.duracionSeg} />
                <div className="space-y-2 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-brand-700">{etiquetaCategoriaVideo[v.categoria]}</p>
                  <h3 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-brand-800">{v.titulo}</h3>
                  <p className="line-clamp-2 text-sm text-slate-500">{v.descripcion}</p>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <TETags ids={v.tiposTE} porId={porId} />
                    {v.materiales.length > 0 && (
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-500">
                        <FileDown className="h-3.5 w-3.5" /> {v.materiales.length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {v.autor} · {formatFecha(v.fechaPublicacion)}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
