import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ClipboardCheck, Inbox, X } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { adminService, type SolicitudExtensionDetalle } from '@/services/adminService';
import { extensionesService } from '@/services/extensionesService';
import { useVersion } from '@/services/eventos';
import { formatFechaHora } from '@/utils/format';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Alert, Avatar, Button, Card, Cargando, EmptyState, Modal, Table, TBody, Td, Th, THead, Tr, Tabs, Textarea, useToast } from '@/components/ui';

type Vista = 'pendientes' | 'resueltas';

export function SolicitudesExtensionesPage() {
  const toast = useToast();
  const version = useVersion('extensiones');
  const { data: solicitudes, loading } = useAsync(() => adminService.listarSolicitudesExtension(), [version]);
  const [vista, setVista] = useState<Vista>('pendientes');
  const [rechazando, setRechazando] = useState<SolicitudExtensionDetalle | null>(null);
  const [motivo, setMotivo] = useState('');
  const [intentado, setIntentado] = useState(false);
  const [procesando, setProcesando] = useState<string | null>(null);

  const pendientes = solicitudes?.filter((s) => s.estado === 'pendiente') ?? [];
  const resueltas = solicitudes?.filter((s) => s.estado !== 'pendiente') ?? [];
  const lista = vista === 'pendientes' ? pendientes : resueltas;

  const aprobar = async (s: SolicitudExtensionDetalle) => {
    setProcesando(s.id);
    await extensionesService.resolverSolicitud(s.id, 'activa');
    setProcesando(null);
    toast.exito('Extensión activada', `${s.extensionNombre} para ${s.usuarioNombre}`);
  };

  const rechazar = async () => {
    setIntentado(true);
    if (!rechazando || !motivo.trim()) return;
    setProcesando(rechazando.id);
    await extensionesService.resolverSolicitud(rechazando.id, 'rechazada', motivo);
    setProcesando(null);
    toast.info('Solicitud rechazada', `${rechazando.extensionNombre} · ${rechazando.usuarioNombre}`);
    setRechazando(null);
  };

  return (
    <div>
      <PageHeader titulo="Solicitudes de extensiones" descripcion="Aprueba o rechaza la activación de extensiones solicitadas por los usuarios." icon={ClipboardCheck} />
      <Card>
        <div className="px-4 pt-3">
          <Tabs
            value={vista}
            onChange={setVista}
            items={[
              { value: 'pendientes', label: 'Pendientes', extra: <span className="rounded-full bg-amber-100 px-1.5 text-xs text-amber-800">{pendientes.length}</span> },
              { value: 'resueltas', label: 'Resueltas', extra: <span className="rounded-full bg-slate-100 px-1.5 text-xs">{resueltas.length}</span> },
            ]}
          />
        </div>
        {loading && !solicitudes ? (
          <Cargando />
        ) : lista.length === 0 ? (
          <EmptyState icon={Inbox} titulo={vista === 'pendientes' ? 'No hay solicitudes pendientes' : 'No hay solicitudes resueltas'} />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Usuario</Th>
                <Th>Extensión</Th>
                <Th>Comentario</Th>
                <Th>Solicitada</Th>
                <Th>Estado</Th>
                <Th className={vista === 'pendientes' ? '' : 'sr-only'}>Acciones</Th>
              </tr>
            </THead>
            <TBody>
              {lista.map((s) => (
                <Tr key={s.id}>
                  <Td>
                    <Link to={`/admin/usuarios/${s.usuarioId}`} className="flex items-center gap-2 hover:text-brand-700">
                      <Avatar nombre={s.usuarioNombre} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-slate-900">{s.usuarioNombre}</span>
                        <span className="block truncate text-xs text-slate-500">{s.usuarioEmail}</span>
                      </span>
                    </Link>
                  </Td>
                  <Td className="font-medium">{s.extensionNombre}</Td>
                  <Td className="max-w-xs">
                    <p className="line-clamp-2 text-xs text-slate-600">{s.comentario || '—'}</p>
                    {s.motivoRechazo && <p className="mt-1 line-clamp-2 text-xs text-red-600">Motivo: {s.motivoRechazo}</p>}
                  </Td>
                  <Td className="whitespace-nowrap text-slate-500">{formatFechaHora(s.fechaSolicitud)}</Td>
                  <Td>
                    <StatusBadge dominio="extension" estado={s.estado} />
                  </Td>
                  <Td>
                    {s.estado === 'pendiente' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="success" icon={Check} loading={procesando === s.id} onClick={() => aprobar(s)}>
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={X}
                          onClick={() => {
                            setRechazando(s);
                            setMotivo('');
                            setIntentado(false);
                          }}
                        >
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Modal
        abierto={!!rechazando}
        onClose={() => setRechazando(null)}
        titulo="Rechazar solicitud"
        descripcion={rechazando && `${rechazando.extensionNombre} · ${rechazando.usuarioNombre}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setRechazando(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={rechazar} loading={!!procesando}>
              Rechazar
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Alert tipo="info">El usuario recibirá una notificación con el motivo y podrá volver a solicitarla.</Alert>
          <Textarea label="Motivo" required rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} error={intentado && !motivo.trim() ? 'El motivo es obligatorio' : undefined} />
        </div>
      </Modal>
    </div>
  );
}
