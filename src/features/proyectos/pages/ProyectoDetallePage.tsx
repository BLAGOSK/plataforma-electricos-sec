import { Outlet, useParams } from 'react-router-dom';
import { ClipboardList, FileStack, FolderSearch, History, LifeBuoy, Lock, MapPin, ShieldAlert, Zap } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { documentosService } from '@/services/documentosService';
import { proyectosService } from '@/services/proyectosService';
import { tiposTEService } from '@/services/tiposTEService';
import { useVersion } from '@/services/eventos';
import { formatNumero } from '@/utils/format';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Alert, Badge, ButtonLink, Card, Cargando, EmptyState, TabsNav } from '@/components/ui';
import { AbrirExtensionMenu } from '../components/AbrirExtensionMenu';
import { CambiarEstadoMenu } from '../components/CambiarEstadoMenu';
import { TipoTEBadge } from '../components/TipoTEBadge';
import type { ProyectoDetalleContext } from '../context';

export function ProyectoDetallePage() {
  const { id = '' } = useParams();
  const usuario = useUsuario();
  const version = useVersion('proyectos');

  const { data, loading, error } = useAsync(async () => {
    const proyecto = await proyectosService.obtener(id);
    const [tipoTE, documentos] = await Promise.all([
      tiposTEService.obtener(proyecto.tipoTEId).catch(() => null),
      documentosService.listarPorProyecto(id),
    ]);
    return { proyecto, tipoTE, documentos };
  }, [id, version]);

  if (loading && !data) return <Cargando />;

  if (error || !data) {
    return (
      <Card>
        <EmptyState
          icon={FolderSearch}
          titulo="Proyecto no encontrado"
          descripcion="El proyecto no existe o fue eliminado."
          accion={<ButtonLink to="/proyectos">Volver a proyectos</ButtonLink>}
        />
      </Card>
    );
  }

  const { proyecto, tipoTE, documentos } = data;

  if (usuario.rol !== 'admin' && proyecto.usuarioId !== usuario.id) {
    return (
      <Card>
        <EmptyState icon={ShieldAlert} titulo="Acceso restringido" descripcion="Este proyecto pertenece a otro usuario." accion={<ButtonLink to="/proyectos">Volver a proyectos</ButtonLink>} />
      </Card>
    );
  }

  const soloLectura = proyecto.estado === 'declarado';
  const contexto: ProyectoDetalleContext = { proyecto, tipoTE, documentos, soloLectura };
  const pendientes = proyecto.docsRequeridos - proyecto.docsCargados;

  return (
    <div>
      <PageHeader
        titulo={proyecto.nombre}
        meta={
          <>
            <span className="text-sm text-slate-500">{proyecto.codigo}</span>
            <StatusBadge dominio="proyecto" estado={proyecto.estado} />
            <TipoTEBadge codigo={proyecto.tipoTECodigo} nombre={proyecto.tipoTENombre} />
            <span className="inline-flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5" /> {proyecto.comuna}
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-slate-500">
              <Zap className="h-3.5 w-3.5" /> {formatNumero(proyecto.potenciaKw, 1)} kW
            </span>
            {soloLectura && (
              <Badge icon={Lock} color="gray">
                Solo lectura
              </Badge>
            )}
          </>
        }
        acciones={
          <>
            <AbrirExtensionMenu proyectoId={proyecto.id} />
            <CambiarEstadoMenu proyecto={proyecto} />
          </>
        }
      />

      {soloLectura && (
        <Alert tipo="exito" className="mb-4" titulo={`Declarado ante la SEC · Folio ${proyecto.folioSec}`}>
          La documentación queda bloqueada. Para modificarla, cambia el estado del proyecto.
        </Alert>
      )}

      <div className="mb-6">
        <TabsNav
          items={[
            { to: 'resumen', label: 'Resumen', icon: ClipboardList },
            {
              to: 'documentos',
              label: 'Documentos',
              icon: FileStack,
              extra:
                pendientes > 0 ? (
                  <span className="rounded-full bg-amber-100 px-1.5 text-xs font-semibold text-amber-800">{pendientes}</span>
                ) : undefined,
            },
            { to: 'control-documental', label: 'Control documental', icon: History },
            { to: 'apoyo', label: 'Apoyo al eléctrico', icon: LifeBuoy },
          ]}
        />
      </div>

      <Outlet context={contexto} />
    </div>
  );
}
