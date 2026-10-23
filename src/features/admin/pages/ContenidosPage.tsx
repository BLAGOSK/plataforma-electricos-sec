import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileUp, Library, Pencil, PlayCircle, Plus, Trash2 } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { useTiposTE } from '@/hooks/useTiposTE';
import { aprendizajeService } from '@/services/aprendizajeService';
import { useVersion } from '@/services/eventos';
import type { DocumentoNormativo, Video } from '@/types/aprendizaje';
import { formatFecha } from '@/utils/format';
import { TETags } from '@/features/aprendizaje/components/TETags';
import { etiquetaCategoriaVideo, formatDuracion, infoCategoriaNormativa } from '@/features/aprendizaje/constantes';
import { PageHeader } from '@/components/PageHeader';
import { Button, Card, Cargando, Table, TBody, Td, Th, THead, Tr, Tabs, useToast } from '@/components/ui';
import { DocumentoNormativoModal } from '../components/DocumentoNormativoModal';
import { VideoModal } from '../components/VideoModal';

type Vista = 'documentos' | 'videos';

export function ContenidosPage() {
  const toast = useToast();
  const { porId } = useTiposTE();
  const version = useVersion('contenidos');
  const [vista, setVista] = useState<Vista>('documentos');
  const { data, loading } = useAsync(async () => {
    const [documentos, videos] = await Promise.all([aprendizajeService.listarDocumentos(), aprendizajeService.listarVideos()]);
    return { documentos, videos };
  }, [version]);

  const [docModal, setDocModal] = useState<{ doc: DocumentoNormativo | null; reemplazo?: boolean } | null>(null);
  const [videoModal, setVideoModal] = useState<{ video: Video | null } | null>(null);

  const eliminarDoc = async (d: DocumentoNormativo) => {
    if (!confirm(`¿Eliminar "${d.codigo} · ${d.titulo}" de la biblioteca?`)) return;
    await aprendizajeService.eliminarDocumento(d.id);
    toast.info('Documento eliminado', d.codigo);
  };

  const eliminarVideo = async (v: Video) => {
    if (!confirm(`¿Eliminar el video "${v.titulo}"?`)) return;
    await aprendizajeService.eliminarVideo(v.id);
    toast.info('Video eliminado', v.titulo);
  };

  return (
    <div>
      <PageHeader
        titulo="Contenidos de aprendizaje"
        descripcion="Agrega, edita, reemplaza o elimina documentos normativos y videos. Los eléctricos solo pueden visualizarlos y descargarlos."
        icon={Library}
        acciones={
          vista === 'documentos' ? (
            <Button icon={Plus} onClick={() => setDocModal({ doc: null })}>
              Nuevo documento
            </Button>
          ) : (
            <Button icon={Plus} onClick={() => setVideoModal({ video: null })}>
              Nuevo video
            </Button>
          )
        }
      />
      <Card>
        <div className="px-4 pt-3">
          <Tabs
            value={vista}
            onChange={setVista}
            items={[
              { value: 'documentos', label: `Documentos (${data?.documentos.length ?? 0})`, icon: Library },
              { value: 'videos', label: `Videos (${data?.videos.length ?? 0})`, icon: PlayCircle },
            ]}
          />
        </div>
        {loading && !data ? (
          <Cargando />
        ) : vista === 'documentos' ? (
          <Table>
            <THead>
              <tr>
                <Th>Documento</Th>
                <Th>Categoría</Th>
                <Th>Versión</Th>
                <Th>Tipos TE</Th>
                <Th>Actualizado</Th>
                <Th className="sr-only">Acciones</Th>
              </tr>
            </THead>
            <TBody>
              {data?.documentos.map((d) => (
                <Tr key={d.id}>
                  <Td className="max-w-sm">
                    <Link to={`/aprendizaje/pliegos/${d.id}`} className="font-medium text-slate-900 hover:text-brand-700">
                      {d.codigo}
                    </Link>
                    <p className="truncate text-xs text-slate-500">{d.titulo}</p>
                  </Td>
                  <Td className="whitespace-nowrap">{infoCategoriaNormativa[d.categoria].label}</Td>
                  <Td className="whitespace-nowrap">{d.version}</Td>
                  <Td>
                    <TETags ids={d.tiposTE} porId={porId} />
                  </Td>
                  <Td className="whitespace-nowrap text-slate-500">{formatFecha(d.fechaActualizacion)}</Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Editar" aria-label="Editar" onClick={() => setDocModal({ doc: d })}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Reemplazar archivo" aria-label="Reemplazar archivo" onClick={() => setDocModal({ doc: d, reemplazo: true })}>
                        <FileUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Eliminar" aria-label="Eliminar" onClick={() => eliminarDoc(d)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Video</Th>
                <Th>Categoría</Th>
                <Th>Duración</Th>
                <Th>Tipos TE</Th>
                <Th>Material</Th>
                <Th>Publicado</Th>
                <Th className="sr-only">Acciones</Th>
              </tr>
            </THead>
            <TBody>
              {data?.videos.map((v) => (
                <Tr key={v.id}>
                  <Td className="max-w-sm">
                    <Link to={`/aprendizaje/videos/${v.id}`} className="line-clamp-1 font-medium text-slate-900 hover:text-brand-700">
                      {v.titulo}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {v.autor}
                      {v.embedUrl ? ' · enlace externo' : ' · reproductor simulado'}
                    </p>
                  </Td>
                  <Td className="whitespace-nowrap">{etiquetaCategoriaVideo[v.categoria]}</Td>
                  <Td className="tabular-nums">{formatDuracion(v.duracionSeg)}</Td>
                  <Td>
                    <TETags ids={v.tiposTE} porId={porId} />
                  </Td>
                  <Td>{v.materiales.length}</Td>
                  <Td className="whitespace-nowrap text-slate-500">{formatFecha(v.fechaPublicacion)}</Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => setVideoModal({ video: v })}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => eliminarVideo(v)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <DocumentoNormativoModal abierto={!!docModal} documento={docModal?.doc ?? null} modoReemplazo={docModal?.reemplazo} onClose={() => setDocModal(null)} />
      <VideoModal abierto={!!videoModal} video={videoModal?.video ?? null} onClose={() => setVideoModal(null)} />
    </div>
  );
}
