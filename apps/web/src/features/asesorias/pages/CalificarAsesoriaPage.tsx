import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Send } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { asesoriasService } from '@/services/asesoriasService';
import { cn } from '@/utils/cn';
import { formatFechaHora } from '@/utils/format';
import { Alert, Avatar, Button, ButtonLink, Card, CardBody, CardFooter, Cargando, EmptyState, StarRating, Textarea, useToast } from '@/components/ui';

const aspectosDisponibles = ['Dominio técnico', 'Claridad', 'Puntualidad', 'Material de apoyo', 'Buena disposición'];
const etiquetas = ['', 'Deficiente', 'Regular', 'Buena', 'Muy buena', 'Excelente'];

export function CalificarAsesoriaPage() {
  const { id = '' } = useParams();
  const usuario = useUsuario();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: reunion, loading } = useAsync(() => asesoriasService.obtenerReunion(id), [id]);

  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [aspectos, setAspectos] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <Cargando />;
  if (!reunion) return <EmptyState titulo="Reunión no encontrada" accion={<ButtonLink to="/asesorias/reuniones">Mis reuniones</ButtonLink>} />;

  if (reunion.calificada || reunion.estado !== 'finalizada') {
    return (
      <Card className="mx-auto max-w-xl">
        <EmptyState
          icon={CheckCircle2}
          titulo={reunion.calificada ? 'Esta asesoría ya fue calificada' : 'La reunión aún no ha finalizado'}
          descripcion={reunion.calificada ? '¡Gracias por tu opinión!' : 'Podrás calificarla una vez que termine.'}
          accion={<ButtonLink to="/asesorias/reuniones">Volver a mis reuniones</ButtonLink>}
        />
      </Card>
    );
  }

  const enviar = async () => {
    if (!estrellas) return setError('Selecciona una calificación de 1 a 5 estrellas.');
    setEnviando(true);
    setError(null);
    try {
      await asesoriasService.calificar(usuario.id, reunion.id, estrellas, comentario, aspectos);
      toast.exito('¡Gracias por tu calificación!', `Tu reseña ayuda a otros instaladores a elegir asesor.`);
      navigate('/asesorias/reuniones');
    } catch (e) {
      setError((e as Error).message);
      setEnviando(false);
    }
  };

  return (
    <Card className="mx-auto max-w-xl">
      <CardBody className="space-y-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <Avatar nombre={reunion.asesorNombre} size="lg" />
          <h1 className="text-xl font-bold text-slate-900">¿Cómo fue tu asesoría?</h1>
          <p className="text-sm text-slate-500">
            {reunion.tema} · con {reunion.asesorNombre}
            <br />
            {formatFechaHora(reunion.fechaInicio)}
          </p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <StarRating value={estrellas} onChange={setEstrellas} size="lg" />
          <p className="h-5 text-sm font-medium text-slate-700">{etiquetas[estrellas]}</p>
        </div>

        <div className="text-left">
          <p className="label">¿Qué destacas?</p>
          <div className="flex flex-wrap gap-2">
            {aspectosDisponibles.map((a) => {
              const activo = aspectos.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAspectos((x) => (activo ? x.filter((y) => y !== a) : [...x, a]))}
                  className={cn(
                    'rounded-full border px-3 py-1 text-sm transition-colors',
                    activo ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:border-slate-300',
                  )}
                >
                  {activo && '✓ '}
                  {a}
                </button>
              );
            })}
          </div>
        </div>

        <Textarea
          containerClassName="text-left"
          label="Comentario"
          rows={4}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Cuéntanos tu experiencia (opcional). Será visible en el perfil del asesor."
        />
        {error && <Alert tipo="error">{error}</Alert>}
      </CardBody>
      <CardFooter>
        <Button variant="ghost" onClick={() => navigate('/asesorias/reuniones')}>
          Más tarde
        </Button>
        <Button icon={Send} onClick={enviar} loading={enviando}>
          Enviar calificación
        </Button>
      </CardFooter>
    </Card>
  );
}
