import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Send, Video } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { asesoriasService } from '@/services/asesoriasService';
import type { Modalidad } from '@/types/asesoria';
import { FileDropzone } from '@/components/FileDropzone';
import { ArchivoItem } from '@/components/FilePreview';
import { PageHeader } from '@/components/PageHeader';
import { Alert, Avatar, Button, Card, CardBody, CardFooter, Cargando, Field, Input, Segmented, StarRating, Textarea, useToast } from '@/components/ui';
import { useProyectoContexto } from '../components/ContextoProyecto';
import { SelectorProyecto } from '../components/SelectorProyecto';

export function SolicitarAsesoriaPage() {
  const { id = '' } = useParams();
  const usuario = useUsuario();
  const navigate = useNavigate();
  const toast = useToast();
  const ctx = useProyectoContexto();

  const { data: asesor, loading } = useAsync(() => asesoriasService.obtenerAsesor(id), [id]);
  const [proyectoId, setProyectoId] = useState(ctx.proyectoId);
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [modalidad, setModalidad] = useState<Modalidad>('videollamada');
  const [adjuntos, setAdjuntos] = useState<File[]>([]);
  const [intentado, setIntentado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading || !asesor) return <Cargando />;

  const errores = {
    asunto: asunto.trim().length < 5 ? 'Describe brevemente el tema (mín. 5 caracteres)' : undefined,
    descripcion: descripcion.trim().length < 20 ? 'Entrega más contexto para el asesor (mín. 20 caracteres)' : undefined,
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setIntentado(true);
    if (errores.asunto || errores.descripcion) return;
    setEnviando(true);
    setError(null);
    try {
      const sol = await asesoriasService.solicitar(usuario.id, {
        asesorId: asesor.id,
        proyectoId: proyectoId || undefined,
        asunto,
        descripcion,
        modalidadPreferida: modalidad,
        adjuntos,
      });
      toast.exito('Solicitud enviada', `${asesor.nombre} recibirá tu solicitud. Puedes continuar la conversación por chat.`);
      navigate(`/asesorias/chat/${sol.conversacionId}`);
    } catch (err) {
      setError((err as Error).message);
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader titulo="Solicitar asesoría" descripcion="Cuéntale al asesor qué necesitas. Se abrirá una conversación para coordinar." />

      <Card className="mb-6">
        <CardBody className="flex items-center gap-4">
          <Avatar nombre={asesor.nombre} size="lg" />
          <div>
            <p className="font-semibold text-slate-900">{asesor.nombre}</p>
            <p className="text-sm text-slate-500">{asesor.titulo}</p>
            {asesor.totalResenas > 0 && <StarRating value={asesor.calificacion} size="sm" mostrarValor totalResenas={asesor.totalResenas} />}
          </div>
        </CardBody>
      </Card>

      <form onSubmit={enviar} noValidate>
        <Card>
          <CardBody className="space-y-5">
            {error && <Alert tipo="error">{error}</Alert>}
            <SelectorProyecto value={proyectoId} onChange={setProyectoId} />
            <Input label="Asunto" required value={asunto} onChange={(e) => setAsunto(e.target.value)} error={intentado ? errores.asunto : undefined} placeholder="Ej: Revisión de memoria de cálculo TE1" />
            <Textarea
              label="Descripción de la consulta"
              required
              rows={5}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              error={intentado ? errores.descripcion : undefined}
              placeholder="Explica el contexto, qué has intentado y qué necesitas resolver."
            />
            <Field id="modalidad" label="Modalidad preferida">
              <Segmented
                value={modalidad}
                onChange={setModalidad}
                items={asesor.modalidades.map((m) => ({ value: m, label: m === 'videollamada' ? 'Videollamada' : 'Presencial', icon: m === 'videollamada' ? Video : Building2 }))}
              />
            </Field>
            <Field id="adjuntos" label="Adjuntos" hint="Planos, fotos o documentos que ayuden a entender la consulta (opcional).">
              <div className="space-y-2">
                <FileDropzone multiple compacto maxMB={20} formatos="PDF, imágenes u otros" onArchivos={(fs) => setAdjuntos((a) => [...a, ...fs])} />
                {adjuntos.map((f, i) => (
                  <ArchivoItem key={`${f.name}-${i}`} archivo={{ nombre: f.name, tipoMime: f.type, tamano: f.size }} onQuitar={() => setAdjuntos((a) => a.filter((_, j) => j !== i))} />
                ))}
              </div>
            </Field>
          </CardBody>
          <CardFooter>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" icon={Send} loading={enviando}>
              Enviar solicitud
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
