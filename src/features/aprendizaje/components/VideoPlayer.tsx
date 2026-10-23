import { useEffect, useState } from 'react';
import { Maximize, Pause, Play, Volume2 } from 'lucide-react';
import type { Video } from '@/types/aprendizaje';
import { formatDuracion } from '../constantes';
import { VideoThumb } from './VideoThumb';

/**
 * Reproductor embebido. Si el video tiene embedUrl (YouTube/Vimeo) se usa un
 * iframe; si no, se muestra un reproductor simulado para la maqueta.
 */
export function VideoPlayer({ video }: { video: Video }) {
  const [reproduciendo, setReproduciendo] = useState(false);
  const [posicion, setPosicion] = useState(0);

  useEffect(() => {
    setReproduciendo(false);
    setPosicion(0);
  }, [video.id]);

  useEffect(() => {
    if (!reproduciendo) return;
    // Avanza 10 s de video por cada segundo real
    const t = setInterval(() => {
      setPosicion((p) => {
        if (p + 10 >= video.duracionSeg) {
          setReproduciendo(false);
          return video.duracionSeg;
        }
        return p + 10;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [reproduciendo, video.duracionSeg]);

  if (video.embedUrl) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl bg-black">
        <iframe
          src={video.embedUrl}
          title={video.titulo}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const pct = (posicion / video.duracionSeg) * 100;

  return (
    <div className="group relative overflow-hidden rounded-xl bg-black">
      <button type="button" onClick={() => setReproduciendo((r) => !r)} className="block w-full" aria-label={reproduciendo ? 'Pausar' : 'Reproducir'}>
        <VideoThumb id={video.id} titulo={video.titulo} duracionSeg={video.duracionSeg} className={reproduciendo ? '[&>span:nth-of-type(1)]:opacity-0' : ''} />
      </button>
      <span className="absolute right-3 top-3 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white/80">Reproductor simulado</span>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8">
        <input
          type="range"
          min={0}
          max={video.duracionSeg}
          value={posicion}
          onChange={(e) => setPosicion(Number(e.target.value))}
          className="h-1 w-full cursor-pointer accent-accent-400"
          style={{ background: `linear-gradient(to right, #fbbf24 ${pct}%, rgba(255,255,255,.3) ${pct}%)` }}
          aria-label="Posición"
        />
        <div className="mt-2 flex items-center gap-3 text-white">
          <button onClick={() => setReproduciendo((r) => !r)} aria-label={reproduciendo ? 'Pausar' : 'Reproducir'}>
            {reproduciendo ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white" />}
          </button>
          <Volume2 className="h-5 w-5 opacity-80" />
          <span className="text-xs tabular-nums">
            {formatDuracion(posicion)} / {formatDuracion(video.duracionSeg)}
          </span>
          <Maximize className="ml-auto h-4 w-4 opacity-80" />
        </div>
      </div>
    </div>
  );
}
