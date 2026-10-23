import { useEffect, useState } from 'react';
import { ArrowRight, Upload } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { documentosService, revisionValida, siguienteRevision } from '@/services/documentosService';
import type { Documento } from '@/types/documento';
import { FileDropzone } from '@/components/FileDropzone';
import { Alert, Badge, Button, Field, Input, Modal, Textarea, useToast } from '@/components/ui';
import { ACCEPT_DOCUMENTOS, FORMATOS_DOCUMENTOS } from '../constantes';
import { ArchivoSeleccionado } from './ArchivoSeleccionado';

interface Props {
  documento: Documento | null;
  onClose: () => void;
}

export function NuevaRevisionModal({ documento, onClose }: Props) {
  const usuario = useUsuario();
  const toast = useToast();
  const [numero, setNumero] = useState('');
  const [comentario, setComentario] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vigente = documento?.revisiones.at(-1);

  useEffect(() => {
    if (!documento) return;
    setNumero(siguienteRevision(documento.esquemaRevision, documento.revisiones.at(-1)?.numero));
    setComentario('');
    setArchivo(null);
    setIntentado(false);
    setError(null);
  }, [documento]);

  if (!documento) return null;

  const errores = {
    numero: !revisionValida(documento.esquemaRevision, numero)
      ? documento.esquemaRevision === 'letras'
        ? 'Usa letras (A, B, C…)'
        : 'Usa números (0, 1, 2…)'
      : documento.revisiones.some((r) => r.numero === numero)
        ? `La Rev. ${numero} ya existe`
        : undefined,
    comentario: !comentario.trim() ? 'Describe qué cambió en esta revisión' : undefined,
    archivo: !archivo ? 'Selecciona el archivo de la nueva revisión' : undefined,
  };

  const guardar = async () => {
    setIntentado(true);
    if (errores.numero || errores.comentario || errores.archivo) return;
    setGuardando(true);
    setError(null);
    try {
      await documentosService.subirRevision(documento.id, usuario.id, { numero, comentario, archivo: archivo! });
      toast.exito('Nueva revisión cargada', `${documento.nombre} · Rev. ${numero} ahora es la vigente`);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      abierto
      onClose={onClose}
      size="lg"
      titulo="Subir nueva revisión"
      descripcion={documento.nombre}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button icon={Upload} onClick={guardar} loading={guardando}>
            Subir Rev. {numero || '—'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert tipo="error">{error}</Alert>}

        <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm">
          <span className="text-slate-500">Vigente:</span>
          <Badge color="gray">Rev. {vigente?.numero}</Badge>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <span className="text-slate-500">Nueva:</span>
          <Badge color="green">Rev. {numero || '—'}</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
          <Input
            label="N° de revisión"
            required
            value={numero}
            onChange={(e) => setNumero(e.target.value.toUpperCase().trim())}
            error={errores.numero}
            maxLength={3}
            hint="Sugerida automáticamente"
          />
          <Textarea
            label="Comentario de cambios"
            required
            rows={3}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            error={intentado ? errores.comentario : undefined}
            placeholder="Ej: Se corrige sección del alimentador según observación del cliente."
          />
        </div>

        <Field id="archivo-rev" label="Archivo" required error={intentado ? errores.archivo : undefined}>
          {archivo ? (
            <ArchivoSeleccionado archivo={archivo} onQuitar={() => setArchivo(null)} />
          ) : (
            <FileDropzone accept={ACCEPT_DOCUMENTOS} formatos={FORMATOS_DOCUMENTOS} maxMB={50} compacto onArchivos={([f]) => f && setArchivo(f)} />
          )}
        </Field>
      </div>
    </Modal>
  );
}
