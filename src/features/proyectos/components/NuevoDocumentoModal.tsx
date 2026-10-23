import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { documentosService, revisionInicial, revisionValida } from '@/services/documentosService';
import type { CategoriaDocumento, EsquemaRevision } from '@/types/documento';
import type { DocumentoRequerido } from '@/types/tipoTE';
import { FileDropzone } from '@/components/FileDropzone';
import { Alert, Button, Field, Input, Modal, Segmented, Select, Textarea, useToast } from '@/components/ui';
import { ACCEPT_DOCUMENTOS, categoriasDocumento, FORMATOS_DOCUMENTOS } from '../constantes';
import { ArchivoSeleccionado } from './ArchivoSeleccionado';

export interface PrefillDocumento {
  archivo?: File;
  requisito?: DocumentoRequerido;
  categoria?: CategoriaDocumento;
}

interface Props {
  abierto: boolean;
  onClose: () => void;
  proyectoId: string;
  requisitos: DocumentoRequerido[];
  prefill?: PrefillDocumento;
}

const sinExtension = (nombre: string) => nombre.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');

export function NuevoDocumentoModal({ abierto, onClose, proyectoId, requisitos, prefill }: Props) {
  const usuario = useUsuario();
  const toast = useToast();
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<CategoriaDocumento>('planos');
  const [requisitoId, setRequisitoId] = useState('');
  const [esquema, setEsquema] = useState<EsquemaRevision>('letras');
  const [numero, setNumero] = useState('A');
  const [comentario, setComentario] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reinicia el formulario cada vez que se abre
  useEffect(() => {
    if (!abierto) return;
    const req = prefill?.requisito;
    const arch = prefill?.archivo ?? null;
    setNombre(req?.nombre ?? (arch ? sinExtension(arch.name) : ''));
    setCategoria(req?.categoria ?? prefill?.categoria ?? 'planos');
    setRequisitoId(req?.id ?? '');
    setEsquema('letras');
    setNumero('A');
    setComentario('');
    setArchivo(arch);
    setIntentado(false);
    setError(null);
  }, [abierto, prefill]);

  const errores = {
    nombre: !nombre.trim() ? 'Ingresa un nombre para el documento' : undefined,
    numero: !revisionValida(esquema, numero) ? (esquema === 'letras' ? 'Usa letras (A, B, C…)' : 'Usa números (0, 1, 2…)') : undefined,
    archivo: !archivo ? 'Selecciona un archivo' : undefined,
  };
  const valido = !errores.nombre && !errores.numero && !errores.archivo;

  const guardar = async () => {
    setIntentado(true);
    if (!valido) return;
    setGuardando(true);
    setError(null);
    try {
      await documentosService.crear(proyectoId, usuario.id, {
        nombre,
        categoria,
        requisitoId: requisitoId || undefined,
        esquemaRevision: esquema,
        numeroRevision: numero,
        comentario,
        archivo: archivo!,
      });
      toast.exito('Documento cargado', `${nombre} · Rev. ${numero}`);
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
      titulo="Subir documento"
      descripcion="La carga es simulada: el archivo no se almacena en un servidor."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button icon={Upload} onClick={guardar} loading={guardando}>
            Subir documento
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert tipo="error">{error}</Alert>}

        <Field id="archivo-doc" label="Archivo" required error={intentado ? errores.archivo : undefined}>
          {archivo ? (
            <ArchivoSeleccionado archivo={archivo} onQuitar={() => setArchivo(null)} />
          ) : (
            <FileDropzone
              accept={ACCEPT_DOCUMENTOS}
              formatos={FORMATOS_DOCUMENTOS}
              maxMB={50}
              compacto
              onArchivos={([f]) => {
                if (!f) return;
                setArchivo(f);
                if (!nombre) setNombre(sinExtension(f.name));
              }}
            />
          )}
        </Field>

        <Input label="Nombre del documento" required value={nombre} onChange={(e) => setNombre(e.target.value)} error={intentado ? errores.nombre : undefined} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Categoría"
            required
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaDocumento)}
            opciones={categoriasDocumento.map((c) => ({ value: c.value, label: c.label }))}
          />
          <Select
            label="Cumple el requisito"
            value={requisitoId}
            onChange={(e) => {
              setRequisitoId(e.target.value);
              const req = requisitos.find((r) => r.id === e.target.value);
              if (req) setCategoria(req.categoria);
            }}
            placeholder="Ninguno (documento adicional)"
            opciones={requisitos.map((r) => ({ value: r.id, label: r.nombre }))}
            hint="Vincula el archivo al checklist del tipo TE"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <Field id="esquema" label="Nomenclatura de revisiones">
            <Segmented
              className="w-full"
              value={esquema}
              onChange={(v) => {
                setEsquema(v);
                setNumero(revisionInicial(v));
              }}
              items={[
                { value: 'letras', label: 'Rev. A, B, C…' },
                { value: 'numeros', label: 'Rev. 0, 1, 2…' },
              ]}
            />
          </Field>
          <Input
            label="Revisión"
            required
            value={numero}
            onChange={(e) => setNumero(e.target.value.toUpperCase().trim())}
            error={errores.numero}
            maxLength={3}
          />
        </div>

        <Textarea label="Comentario" value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Ej: Emisión inicial para revisión del cliente." rows={2} />
      </div>
    </Modal>
  );
}
