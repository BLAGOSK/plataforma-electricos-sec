import type { ComponentType } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { FolderKanban, Lock, PuzzleIcon } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { extensionesService } from '@/services/extensionesService';
import { proyectosService } from '@/services/proyectosService';
import { useVersion } from '@/services/eventos';
import type { ExtensionSlug } from '@/types/extension';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { ButtonLink, Card, Cargando, EmptyState, Select } from '@/components/ui';
import { Alumbrado } from '../herramientas/Alumbrado';
import { CaidaTension } from '../herramientas/CaidaTension';
import { Conductores } from '../herramientas/Conductores';
import { Cortocircuito } from '../herramientas/Cortocircuito';
import { iconosExtension } from '../iconos';

const herramientas: Record<ExtensionSlug, ComponentType<{ proyectoNombre?: string }>> = {
  conductores: Conductores,
  'caida-tension': CaidaTension,
  cortocircuito: Cortocircuito,
  alumbrado: Alumbrado,
};

export function ExtensionHostPage() {
  const { slug = '' } = useParams();
  const usuario = useUsuario();
  const [params, setParams] = useSearchParams();
  const proyectoId = params.get('proyecto') ?? '';
  const version = useVersion('extensiones');

  const { data, loading, error } = useAsync(async () => {
    const [extension, proyectos] = await Promise.all([
      extensionesService.obtenerParaUsuario(usuario.id, slug as ExtensionSlug),
      proyectosService.listar(usuario),
    ]);
    return { extension, proyectos };
  }, [slug, usuario, version]);

  if (loading && !data) return <Cargando />;
  if (error || !data || !(slug in herramientas)) {
    return (
      <Card>
        <EmptyState icon={PuzzleIcon} titulo="Extensión no encontrada" accion={<ButtonLink to="/extensiones">Ver catálogo</ButtonLink>} />
      </Card>
    );
  }

  const { extension, proyectos } = data;
  const Icon = iconosExtension[extension.slug];

  if (extension.estado !== 'activa') {
    return (
      <Card>
        <EmptyState
          icon={Lock}
          titulo={`${extension.nombre} no está activa en tu cuenta`}
          descripcion={
            <span className="flex flex-col items-center gap-2">
              <StatusBadge dominio="extension" estado={extension.estado} />
              Solicita su activación desde el catálogo. Un administrador debe aprobarla.
            </span>
          }
          accion={<ButtonLink to="/extensiones">Ir al catálogo de extensiones</ButtonLink>}
        />
      </Card>
    );
  }

  const Herramienta = herramientas[extension.slug];
  const proyecto = proyectos.find((p) => p.id === proyectoId);

  return (
    <div>
      <PageHeader
        titulo={extension.nombre}
        descripcion={extension.descripcionCorta}
        icon={Icon}
        acciones={
          <Select
            containerClassName="w-72"
            value={proyectoId}
            onChange={(e) => {
              const p = new URLSearchParams(params);
              if (e.target.value) p.set('proyecto', e.target.value);
              else p.delete('proyecto');
              setParams(p, { replace: true });
            }}
            placeholder="Sin proyecto asociado"
            opciones={proyectos.map((p) => ({ value: p.id, label: `${p.codigo} · ${p.nombre}` }))}
            aria-label="Proyecto asociado"
          />
        }
      />
      {proyecto && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-brand-900">
          <FolderKanban className="h-4 w-4" />
          Trabajando en el proyecto{' '}
          <Link to={`/proyectos/${proyecto.id}`} className="font-semibold underline-offset-2 hover:underline">
            {proyecto.nombre}
          </Link>
          <span className="text-brand-700">· {proyecto.tipoTECodigo} · {proyecto.potenciaKw} kW</span>
        </div>
      )}
      <Herramienta key={extension.slug} proyectoNombre={proyecto?.nombre} />
    </div>
  );
}
