import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { useTiposTE } from '@/hooks/useTiposTE';
import { asesoriasService } from '@/services/asesoriasService';
import { useVersion } from '@/services/eventos';
import type { Asesor } from '@/types/asesoria';
import { formatCLP } from '@/utils/format';
import { TETags } from '@/features/aprendizaje/components/TETags';
import { PageHeader } from '@/components/PageHeader';
import { Avatar, Badge, Button, Card, Cargando, StarRating, Table, TBody, Td, Th, THead, Tr, useToast } from '@/components/ui';
import { AsesorFormModal } from '../components/AsesorFormModal';

export function AsesoresAdminPage() {
  const toast = useToast();
  const { porId } = useTiposTE();
  const version = useVersion('asesorias');
  const { data: asesores, loading } = useAsync(() => asesoriasService.listarTodos(), [version]);
  const [modal, setModal] = useState<{ asesor: Asesor | null } | null>(null);

  const alternarActivo = async (a: Asesor) => {
    const { id, calificacion: _c, totalResenas: _t, ...payload } = a;
    await asesoriasService.actualizarAsesor(id, { ...payload, activo: !a.activo });
    toast.info(a.activo ? 'Asesor oculto del directorio' : 'Asesor visible en el directorio', a.nombre);
  };

  const eliminar = async (a: Asesor) => {
    if (!confirm(`¿Eliminar a ${a.nombre}?`)) return;
    try {
      await asesoriasService.eliminarAsesor(a.id);
      toast.info('Asesor eliminado', a.nombre);
    } catch (e) {
      toast.error('No se pudo eliminar', (e as Error).message);
    }
  };

  return (
    <div>
      <PageHeader
        titulo="Asesores"
        descripcion="Administra el directorio de profesionales asesores."
        icon={Users}
        acciones={
          <Button icon={Plus} onClick={() => setModal({ asesor: null })}>
            Nuevo asesor
          </Button>
        }
      />
      <Card>
        {loading && !asesores ? (
          <Cargando />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Asesor</Th>
                <Th>Especialidades</Th>
                <Th>Tipos TE</Th>
                <Th>Calificación</Th>
                <Th>Tarifa</Th>
                <Th>Estado</Th>
                <Th className="sr-only">Acciones</Th>
              </tr>
            </THead>
            <TBody>
              {asesores?.map((a) => (
                <Tr key={a.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar nombre={a.nombre} size="sm" />
                      <div className="min-w-0">
                        <Link to={`/asesorias/asesores/${a.id}`} className="font-medium text-slate-900 hover:text-brand-700">
                          {a.nombre}
                        </Link>
                        <p className="truncate text-xs text-slate-500">{a.titulo}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="max-w-xs">
                    <p className="line-clamp-2 text-xs text-slate-600">{a.especialidades.join(' · ')}</p>
                  </Td>
                  <Td>
                    <TETags ids={a.tiposTE} porId={porId} />
                  </Td>
                  <Td className="whitespace-nowrap">
                    {a.totalResenas ? <StarRating value={a.calificacion} size="sm" mostrarValor totalResenas={a.totalResenas} /> : <span className="text-xs text-slate-400">Sin reseñas</span>}
                  </Td>
                  <Td className="whitespace-nowrap">{formatCLP(a.tarifaHora)}</Td>
                  <Td>
                    <button onClick={() => alternarActivo(a)} title="Cambiar visibilidad">
                      {a.activo ? <Badge color="green" dot>Activo</Badge> : <Badge dot>Inactivo</Badge>}
                    </button>
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => setModal({ asesor: a })}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => eliminar(a)}>
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
      <AsesorFormModal abierto={!!modal} asesor={modal?.asesor ?? null} onClose={() => setModal(null)} />
    </div>
  );
}
