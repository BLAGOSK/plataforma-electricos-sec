import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, FolderPlus } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { proyectosService } from '@/services/proyectosService';
import { tiposTEService } from '@/services/tiposTEService';
import { PageHeader } from '@/components/PageHeader';
import { Alert, Button, Card, CardBody, CardFooter, Cargando, Stepper, useToast } from '@/components/ui';
import { PasoDatosGenerales } from '../components/wizard/PasoDatosGenerales';
import { PasoResumen } from '../components/wizard/PasoResumen';
import { PasoTipoTE } from '../components/wizard/PasoTipoTE';
import { aPayload, formProyectoVacio, validarDatosGenerales, type FormProyecto } from '../components/wizard/tipos';

const pasos = [
  { titulo: 'Datos generales', descripcion: 'Cliente, ubicación y potencia' },
  { titulo: 'Tipo TE', descripcion: 'Declaración a realizar' },
  { titulo: 'Resumen', descripcion: 'Revisa y confirma' },
];

export function ProyectoNuevoPage() {
  const usuario = useUsuario();
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();

  const [paso, setPaso] = useState(0);
  const [form, setForm] = useState<FormProyecto>({ ...formProyectoVacio, tipoTEId: params.get('tipo') ?? '' });
  const [intentado, setIntentado] = useState<Record<number, boolean>>({});
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: tipos, loading } = useAsync(() => tiposTEService.listar({ soloActivos: true }), []);

  const erroresDatos = useMemo(() => validarDatosGenerales(form), [form]);
  const errorTipo = form.tipoTEId ? undefined : 'Selecciona el tipo de declaración';

  const onChange = <K extends keyof FormProyecto>(campo: K, valor: FormProyecto[K]) => setForm((f) => ({ ...f, [campo]: valor }));

  const pasoValido = (n: number) => (n === 0 ? Object.keys(erroresDatos).length === 0 : n === 1 ? !errorTipo : true);

  const siguiente = () => {
    setIntentado((i) => ({ ...i, [paso]: true }));
    if (!pasoValido(paso)) return;
    setPaso((p) => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const irAPaso = (n: number) => {
    // Solo se puede avanzar si los pasos anteriores son válidos
    for (let i = 0; i < n; i++) if (!pasoValido(i)) return setPaso(i);
    setPaso(n);
  };

  const crear = async () => {
    setCreando(true);
    setError(null);
    try {
      const proyecto = await proyectosService.crear(usuario.id, aPayload(form));
      toast.exito('Proyecto creado', `${proyecto.codigo} · ${proyecto.nombre}`);
      navigate(`/proyectos/${proyecto.id}/documentos`, { replace: true });
    } catch (e) {
      setError((e as Error).message);
      setCreando(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader titulo="Nuevo proyecto" descripcion="Completa los pasos para registrar un nuevo proyecto eléctrico." icon={FolderPlus} />

      <div className="mb-6">
        <Stepper pasos={pasos} actual={paso} />
      </div>

      <Card>
        <CardBody>
          {error && (
            <Alert tipo="error" className="mb-4">
              {error}
            </Alert>
          )}
          {paso === 0 && <PasoDatosGenerales form={form} errores={intentado[0] ? erroresDatos : {}} onChange={onChange} />}
          {paso === 1 &&
            (loading || !tipos ? (
              <Cargando />
            ) : (
              <PasoTipoTE
                tipos={tipos}
                seleccionado={form.tipoTEId}
                onSeleccionar={(id) => onChange('tipoTEId', id)}
                error={intentado[1] ? errorTipo : undefined}
              />
            ))}
          {paso === 2 && <PasoResumen form={form} tipo={tipos?.find((t) => t.id === form.tipoTEId)} irAPaso={irAPaso} />}
        </CardBody>
        <CardFooter className="justify-between">
          {paso === 0 ? (
            <Button variant="ghost" onClick={() => navigate('/proyectos')}>
              Cancelar
            </Button>
          ) : (
            <Button variant="outline" icon={ArrowLeft} onClick={() => setPaso((p) => p - 1)}>
              Anterior
            </Button>
          )}
          {paso < pasos.length - 1 ? (
            <Button iconRight={ArrowRight} onClick={siguiente}>
              Siguiente
            </Button>
          ) : (
            <Button icon={Check} onClick={crear} loading={creando}>
              Crear proyecto
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
