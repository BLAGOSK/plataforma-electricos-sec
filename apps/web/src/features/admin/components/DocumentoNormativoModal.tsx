import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { aprendizajeService } from '@/services/aprendizajeService';
import type { CategoriaNormativa, DocumentoNormativo, DocumentoNormativoPayload } from '@/types/aprendizaje';
import { categoriasNormativa } from '@/features/aprendizaje/constantes';
import { ArchivoSeleccionado } from '@/features/proyectos/components/ArchivoSeleccionado';
import { FileDropzone } from '@/components/FileDropzone';
import { ArchivoItem } from '@/components/FilePreview';
import { Alert, Button, Field, Input, Modal, Select, Switch, Textarea, useToast } from '@/components/ui';
import { SelectorTiposTE } from './SelectorTiposTE';

interface Props {
  abierto: boolean;
  documento: DocumentoNormativo | null;
  /** Abre el modal enfocado en reemplazar el archivo */
  modoReemplazo?: boolean;
  onClose: () => void;
}

const vacio: DocumentoNormativoPayload = {
  codigo: '',
  titulo: '',
  descripcion: '',
  categoria: 'pliego_ric',
  version: '',
  fecha: new Date().toISOString(),
  tiposTE: [],
  referencial: true,
};

export function DocumentoNormativoModal({ abierto, documento, modoReemplazo, onClose }: Props) {
  const toast = useToast();
  const [f, setF] = useState<DocumentoNormativoPayload>(vacio);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    if (documento) {
      const { id: _id, archivo: _a, fechaActualizacion: _f, ...resto } = documento;
      setF(structuredClone(resto));
    } else setF(vacio);
    setArchivo(null);
    setIntentado(false);
    setError(null);
  }, [abierto, documento]);

  const errores = {
    codigo: !f.codigo.trim() ? 'Ingresa el código o número' : undefined,
    titulo: !f.titulo.trim() ? 'Ingresa el título' : undefined,
    version: !f.version.trim() ? 'Ingresa la versión' : undefined,
    archivo: !documento && !archivo ? 'Adjunta el archivo del documento' : modoReemplazo && !archivo ? 'Selecciona el nuevo archivo' : undefined,
  };

  const guardar = async () => {
    setIntentado(true);
    if (Object.values(errores).some(Boolean)) return;
    setGuardando(true);
    setError(null);
    try {
      if (documento) await aprendizajeService.actualizarDocumento(documento.id, f, archivo ?? undefined);
      else await aprendizajeService.crearDocumento(f, archivo!);
      toast.exito(documento ? (archivo ? 'Archivo reemplazado' : 'Documento actualizado') : 'Documento publicado', `${f.codigo} · ${f.titulo}`);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      abierto={abierto}
      onClose={onClose}
      size="lg"
      titulo={modoReemplazo ? 'Reemplazar archivo' : documento ? 'Editar documento' : 'Nuevo documento normativo'}
      descripcion={documento ? `${documento.codigo} · ${documento.titulo}` : 'Se publicará en la biblioteca de Aprendizaje.'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button icon={Save} onClick={guardar} loading={guardando}>
            {modoReemplazo ? 'Reemplazar' : 'Guardar'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert tipo="error">{error}</Alert>}
        {!modoReemplazo && (
          <>
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <Input label="Código" required value={f.codigo} onChange={(e) => setF({ ...f, codigo: e.target.value })} error={intentado ? errores.codigo : undefined} placeholder="RIC N°20" />
              <Input label="Título" required value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} error={intentado ? errores.titulo : undefined} />
            </div>
            <Textarea label="Descripción" rows={2} value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Select
                label="Categoría"
                value={f.categoria}
                onChange={(e) => setF({ ...f, categoria: e.target.value as CategoriaNormativa })}
                opciones={categoriasNormativa.map((c) => ({ value: c.value, label: c.label }))}
              />
              <Input label="Versión" required value={f.version} onChange={(e) => setF({ ...f, version: e.target.value })} error={intentado ? errores.version : undefined} placeholder="Ed. 1 (2026)" />
              <Input label="Fecha" type="date" value={f.fecha.slice(0, 10)} onChange={(e) => e.target.value && setF({ ...f, fecha: new Date(e.target.value).toISOString() })} />
            </div>
            <SelectorTiposTE value={f.tiposTE} onChange={(ids) => setF({ ...f, tiposTE: ids })} />
            <Switch label="Contenido referencial a validar" checked={f.referencial} onChange={(v) => setF({ ...f, referencial: v })} />
          </>
        )}
        {modoReemplazo && (
          <Input label="Nueva versión" value={f.version} onChange={(e) => setF({ ...f, version: e.target.value })} error={intentado ? errores.version : undefined} hint="Actualiza la versión del documento reemplazado" />
        )}
        <Field id="archivo-norm" label={documento ? 'Reemplazar archivo' : 'Archivo'} required={!documento || modoReemplazo} error={intentado ? errores.archivo : undefined}>
          {documento && !archivo && <ArchivoItem archivo={documento.archivo} onDescargar className="mb-2" />}
          {archivo ? (
            <ArchivoSeleccionado archivo={archivo} onQuitar={() => setArchivo(null)} />
          ) : (
            <FileDropzone accept="application/pdf" formatos="PDF" maxMB={50} compacto onArchivos={([a]) => a && setArchivo(a)} />
          )}
        </Field>
      </div>
    </Modal>
  );
}
