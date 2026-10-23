import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { aEmbedUrl, aprendizajeService } from '@/services/aprendizajeService';
import type { CategoriaVideo, Video, VideoPayload } from '@/types/aprendizaje';
import { categoriasVideo, formatDuracion } from '@/features/aprendizaje/constantes';
import { FileDropzone } from '@/components/FileDropzone';
import { ArchivoItem } from '@/components/FilePreview';
import { Alert, Button, Field, Input, Modal, Select, Textarea, useToast } from '@/components/ui';
import { SelectorTiposTE } from './SelectorTiposTE';

interface Props {
  abierto: boolean;
  video: Video | null;
  onClose: () => void;
}

const vacio: VideoPayload = {
  titulo: '',
  descripcion: '',
  categoria: 'tutorial',
  duracionSeg: 600,
  embedUrl: undefined,
  autor: 'Equipo Eléctricos SEC',
  fechaPublicacion: new Date().toISOString(),
  tiposTE: [],
};

/** "12:30" o "1:02:10" → segundos */
function aSegundos(txt: string): number | null {
  const partes = txt.trim().split(':').map(Number);
  if (partes.some((p) => Number.isNaN(p)) || partes.length < 2 || partes.length > 3) return null;
  return partes.reduce((acc, p) => acc * 60 + p, 0);
}

export function VideoModal({ abierto, video, onClose }: Props) {
  const toast = useToast();
  const [f, setF] = useState<VideoPayload>(vacio);
  const [duracion, setDuracion] = useState('10:00');
  const [url, setUrl] = useState('');
  const [nuevos, setNuevos] = useState<File[]>([]);
  const [quitados, setQuitados] = useState<string[]>([]);
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    if (video) {
      const { id: _id, materiales: _m, ...resto } = video;
      setF(structuredClone(resto));
      setDuracion(formatDuracion(video.duracionSeg));
      setUrl(video.embedUrl ?? '');
    } else {
      setF(vacio);
      setDuracion('10:00');
      setUrl('');
    }
    setNuevos([]);
    setQuitados([]);
    setIntentado(false);
    setError(null);
  }, [abierto, video]);

  const seg = aSegundos(duracion);
  const embed = url.trim() ? aEmbedUrl(url) : undefined;
  const errores = {
    titulo: !f.titulo.trim() ? 'Ingresa el título' : undefined,
    duracion: !seg ? 'Formato mm:ss o h:mm:ss' : undefined,
    url: url.trim() && !embed ? 'Usa un enlace de YouTube o Vimeo' : undefined,
  };

  const guardar = async () => {
    setIntentado(true);
    if (Object.values(errores).some(Boolean)) return;
    setGuardando(true);
    setError(null);
    const payload: VideoPayload = { ...f, duracionSeg: seg!, embedUrl: embed };
    try {
      if (video) await aprendizajeService.actualizarVideo(video.id, payload, nuevos, quitados);
      else await aprendizajeService.crearVideo(payload, nuevos);
      toast.exito(video ? 'Video actualizado' : 'Video publicado', f.titulo);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const materialesActuales = video?.materiales.filter((m) => !quitados.includes(m.id)) ?? [];

  return (
    <Modal
      abierto={abierto}
      onClose={onClose}
      size="lg"
      titulo={video ? 'Editar video' : 'Nuevo video'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button icon={Save} onClick={guardar} loading={guardando}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert tipo="error">{error}</Alert>}
        <Input label="Título" required value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} error={intentado ? errores.titulo : undefined} />
        <Textarea label="Descripción" rows={3} value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Select label="Categoría" value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value as CategoriaVideo })} opciones={categoriasVideo} />
          <Input label="Duración" required value={duracion} onChange={(e) => setDuracion(e.target.value)} error={intentado ? errores.duracion : undefined} placeholder="24:35" />
          <Input label="Autor" value={f.autor} onChange={(e) => setF({ ...f, autor: e.target.value })} />
        </div>
        <Input
          label="Enlace del video"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={errores.url}
          placeholder="https://www.youtube.com/watch?v=…"
          hint={embed ? 'Se insertará el reproductor de la plataforma de video.' : 'Opcional. Sin enlace se muestra un reproductor simulado.'}
        />
        <SelectorTiposTE value={f.tiposTE} onChange={(ids) => setF({ ...f, tiposTE: ids })} />
        <Field id="materiales" label="Material de apoyo descargable">
          <div className="space-y-2">
            {materialesActuales.map((m) => (
              <ArchivoItem key={m.id} archivo={m} onQuitar={() => setQuitados((q) => [...q, m.id])} />
            ))}
            {nuevos.map((n, i) => (
              <ArchivoItem key={`${n.name}-${i}`} archivo={{ nombre: n.name, tipoMime: n.type, tamano: n.size }} onQuitar={() => setNuevos((x) => x.filter((_, j) => j !== i))} />
            ))}
            <FileDropzone multiple compacto maxMB={50} formatos="PDF u otros" onArchivos={(fs) => setNuevos((x) => [...x, ...fs])} />
          </div>
        </Field>
      </div>
    </Modal>
  );
}
