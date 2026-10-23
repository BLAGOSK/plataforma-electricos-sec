import { useState } from 'react';
import { ListChecks, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { tiposTEService } from '@/services/tiposTEService';
import { useVersion } from '@/services/eventos';
import type { TipoTE } from '@/types/tipoTE';
import { PageHeader } from '@/components/PageHeader';
import { ReferencialAviso, ReferencialBadge } from '@/components/ReferencialAviso';
import { Badge, Button, Card, Cargando, Table, TBody, Td, Th, THead, Tr, useToast } from '@/components/ui';
import { TipoTEFormModal } from '../components/TipoTEFormModal';

export function TiposTEPage() {
  const toast = useToast();
  const version = useVersion('proyectos');
  const { data, loading } = useAsync(async () => {
    const [tipos, uso] = await Promise.all([tiposTEService.listar(), tiposTEService.proyectosPorTipo()]);
    return { tipos, uso };
  }, [version]);
  const [editando, setEditando] = useState<TipoTE | null>(null);
  const [abierto, setAbierto] = useState(false);

  const abrir = (t: TipoTE | null) => {
    setEditando(t);
    setAbierto(true);
  };

  const alternarActivo = async (t: TipoTE) => {
    const { id, ...payload } = t;
    await tiposTEService.actualizar(id, { ...payload, activo: !t.activo });
    toast.info(t.activo ? `${t.codigo} desactivado` : `${t.codigo} activado`);
  };

  const eliminar = async (t: TipoTE) => {
    if (!confirm(`¿Eliminar ${t.codigo} — ${t.nombre}?`)) return;
    try {
      await tiposTEService.eliminar(t.id);
      toast.info('Tipo TE eliminado', t.codigo);
    } catch (e) {
      toast.error('No se pudo eliminar', (e as Error).message);
    }
  };

  return (
    <div>
      <PageHeader
        titulo="Catálogo de tipos TE"
        descripcion="Define los tipos de declaración disponibles, sus documentos requeridos y la guía de apoyo."
        icon={ListChecks}
        acciones={
          <Button icon={Plus} onClick={() => abrir(null)}>
            Nuevo tipo TE
          </Button>
        }
      />
      <div className="mb-4">
        <ReferencialAviso>Los tipos TE precargados son datos de ejemplo. Valida su contenido y desmarca «referencial» cuando corresponda.</ReferencialAviso>
      </div>
      <Card>
        {loading && !data ? (
          <Cargando />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Código</Th>
                <Th>Nombre</Th>
                <Th>Documentos</Th>
                <Th>Guía</Th>
                <Th>Proyectos</Th>
                <Th>Estado</Th>
                <Th className="sr-only">Acciones</Th>
              </tr>
            </THead>
            <TBody>
              {data?.tipos.map((t) => (
                <Tr key={t.id}>
                  <Td>
                    <span className="rounded bg-brand-700 px-2 py-0.5 text-sm font-bold text-white">{t.codigo}</span>
                  </Td>
                  <Td className="max-w-sm">
                    <p className="font-medium text-slate-900">{t.nombre}</p>
                    <p className="line-clamp-1 text-xs text-slate-500">{t.descripcion}</p>
                    {t.referencial && (
                      <div className="mt-1">
                        <ReferencialBadge />
                      </div>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap">
                    {t.documentosRequeridos.filter((d) => d.obligatorio).length} oblig. / {t.documentosRequeridos.length}
                  </Td>
                  <Td>{t.guia.length} pasos</Td>
                  <Td>{data.uso[t.id] ?? 0}</Td>
                  <Td>
                    <button onClick={() => alternarActivo(t)} title="Cambiar estado">
                      {t.activo ? <Badge color="green" dot>Activo</Badge> : <Badge dot>Inactivo</Badge>}
                    </button>
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label={`Editar ${t.codigo}`} onClick={() => abrir(t)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Eliminar ${t.codigo}`} onClick={() => eliminar(t)}>
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
      <TipoTEFormModal tipo={editando} abierto={abierto} onClose={() => setAbierto(false)} />
    </div>
  );
}
