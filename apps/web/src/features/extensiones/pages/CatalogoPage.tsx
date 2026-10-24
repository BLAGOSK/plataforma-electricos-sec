import { useState } from 'react';
import { Check, Clock, ExternalLink, Puzzle, RotateCcw, Send, XCircle } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { extensionesService } from '@/services/extensionesService';
import { useVersion } from '@/services/eventos';
import type { ExtensionConEstado } from '@/types/extension';
import { formatFecha } from '@/utils/format';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Alert, Button, ButtonLink, Card, Cargando, Modal, Textarea, useToast } from '@/components/ui';
import { iconosExtension } from '../iconos';

export function CatalogoPage() {
  const usuario = useUsuario();
  const toast = useToast();
  const version = useVersion('extensiones');
  const { data: extensiones, loading } = useAsync(() => extensionesService.listarParaUsuario(usuario.id), [usuario.id, version]);
  const [solicitando, setSolicitando] = useState<ExtensionConEstado | null>(null);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abrirSolicitud = (e: ExtensionConEstado) => {
    setSolicitando(e);
    setComentario('');
    setError(null);
  };

  const enviar = async () => {
    if (!solicitando) return;
    setEnviando(true);
    setError(null);
    try {
      await extensionesService.solicitar(usuario.id, solicitando.id, comentario);
      toast.exito('Solicitud enviada', 'Un administrador revisará tu solicitud de activación.');
      setSolicitando(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <PageHeader
        titulo="Extensiones"
        descripcion="Herramientas de cálculo que puedes activar en tu cuenta. Las extensiones activas aparecen en el menú lateral y en el detalle de cada proyecto."
        icon={Puzzle}
      />

      <Alert tipo="info" className="mb-6" titulo="Herramientas en maqueta">
        Las herramientas muestran formularios de entrada y resultados de ejemplo. Los cálculos reales se implementarán en una fase posterior.
      </Alert>

      {loading && !extensiones ? (
        <Cargando />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {extensiones?.map((e) => {
            const Icon = iconosExtension[e.slug];
            return (
              <Card key={e.id} className="flex flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-xl bg-accent-50 p-3 text-accent-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <StatusBadge dominio="extension" estado={e.estado} />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">{e.nombre}</h2>
                <p className="mt-1 text-sm text-slate-600">{e.descripcion}</p>
                <ul className="mt-4 flex-1 space-y-1.5">
                  {e.caracteristicas.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {c}
                    </li>
                  ))}
                </ul>

                {e.estado === 'rechazada' && e.solicitud?.motivoRechazo && (
                  <Alert tipo="error" className="mt-4">
                    <strong>Rechazada:</strong> {e.solicitud.motivoRechazo}
                  </Alert>
                )}

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">
                    {e.estado === 'activa' && e.solicitud?.fechaResolucion && `Activa desde ${formatFecha(e.solicitud.fechaResolucion)}`}
                    {e.estado === 'pendiente' && e.solicitud && `Solicitada el ${formatFecha(e.solicitud.fechaSolicitud)}`}
                  </p>
                  {e.estado === 'activa' && (
                    <ButtonLink to={`/extensiones/${e.slug}`} icon={ExternalLink}>
                      Abrir
                    </ButtonLink>
                  )}
                  {e.estado === 'pendiente' && (
                    <Button variant="outline" icon={Clock} disabled>
                      En revisión
                    </Button>
                  )}
                  {e.estado === 'no_solicitada' && (
                    <Button icon={Send} onClick={() => abrirSolicitud(e)}>
                      Solicitar activación
                    </Button>
                  )}
                  {e.estado === 'rechazada' && (
                    <Button variant="outline" icon={RotateCcw} onClick={() => abrirSolicitud(e)}>
                      Volver a solicitar
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        abierto={!!solicitando}
        onClose={() => setSolicitando(null)}
        titulo="Solicitar activación"
        descripcion={solicitando?.nombre}
        footer={
          <>
            <Button variant="outline" onClick={() => setSolicitando(null)}>
              Cancelar
            </Button>
            <Button icon={Send} onClick={enviar} loading={enviando}>
              Enviar solicitud
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && (
            <Alert tipo="error">
              <XCircle className="mr-1 inline h-4 w-4" />
              {error}
            </Alert>
          )}
          <p className="text-sm text-slate-600">La activación debe ser aprobada por un administrador. Te notificaremos cuando se resuelva.</p>
          <Textarea label="Comentario (opcional)" rows={3} value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="¿Para qué tipo de proyectos la usarás?" />
        </div>
      </Modal>
    </div>
  );
}
