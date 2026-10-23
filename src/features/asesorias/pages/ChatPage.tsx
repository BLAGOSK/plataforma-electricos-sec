import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, Download, FolderKanban, MessagesSquare, Paperclip, Search, Send, UserRound, X } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { archivoDisponible, descargarArchivo, esImagen } from '@/services/archivos';
import { chatService } from '@/services/chatService';
import { useVersion } from '@/services/eventos';
import type { Mensaje } from '@/types/asesoria';
import { cn } from '@/utils/cn';
import { formatBytes, formatFecha, formatHora, tiempoRelativo } from '@/utils/format';
import { coincide } from '@/utils/texto';
import { iconoArchivo } from '@/components/FilePreview';
import { Avatar, ButtonLink, Card, EmptyState, Spinner } from '@/components/ui';
import { AsesoriasHeader } from '../components/AsesoriasHeader';

function Burbuja({ m, asesorNombre }: { m: Mensaje; asesorNombre: string }) {
  const propio = m.autor === 'usuario';
  return (
    <div className={cn('flex items-end gap-2', propio && 'flex-row-reverse')}>
      {!propio && <Avatar nombre={asesorNombre} size="xs" />}
      <div className={cn('max-w-[80%] space-y-1.5 sm:max-w-[65%]', propio && 'items-end')}>
        {m.texto && (
          <div
            className={cn(
              'whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm',
              propio ? 'rounded-br-sm bg-brand-700 text-white' : 'rounded-bl-sm bg-white text-slate-800 ring-1 ring-slate-200',
            )}
          >
            {m.texto}
          </div>
        )}
        {m.adjuntos.map((a) => {
          const Icon = iconoArchivo(a.tipoMime, a.nombre);
          const disponible = archivoDisponible(a);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => descargarArchivo(a)}
              disabled={!disponible}
              className="flex w-full items-center gap-2.5 rounded-xl bg-white p-2 text-left ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed"
            >
              {esImagen(a.tipoMime) && disponible ? (
                <img src={a.url} alt="" className="h-10 w-10 rounded object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-800">{a.nombre}</span>
                <span className="block text-xs text-slate-500">{disponible ? formatBytes(a.tamano) : 'No disponible (sesión anterior)'}</span>
              </span>
              {disponible && <Download className="h-4 w-4 shrink-0 text-slate-400" />}
            </button>
          );
        })}
        <p className={cn('text-[11px] text-slate-400', propio && 'text-right')}>{formatHora(m.fecha)}</p>
      </div>
    </div>
  );
}

export function ChatPage() {
  const { conversacionId } = useParams();
  const usuario = useUsuario();
  const navigate = useNavigate();
  const version = useVersion('chat');
  const [filtro, setFiltro] = useState('');
  const [texto, setTexto] = useState('');
  const [adjuntos, setAdjuntos] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const finRef = useRef<HTMLDivElement>(null);

  const { data: conversaciones = [], loading } = useAsync(() => chatService.listarConversaciones(usuario.id), [usuario.id, version]);
  const { data: mensajes = [] } = useAsync(
    () => (conversacionId ? chatService.listarMensajes(conversacionId) : Promise.resolve([] as Mensaje[])),
    [conversacionId, version],
  );

  const actual = conversaciones.find((c) => c.id === conversacionId);
  const escribiendo = conversacionId ? chatService.estaEscribiendo(conversacionId) : false;
  const filtradas = useMemo(() => conversaciones.filter((c) => coincide(filtro, c.asesorNombre, c.asunto)), [conversaciones, filtro]);

  // Marcar como leída al abrir o al recibir mensajes
  useEffect(() => {
    if (actual && actual.noLeidos > 0) chatService.marcarLeida(actual.id);
  }, [actual]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [mensajes.length, escribiendo, conversacionId]);

  useEffect(() => {
    setTexto('');
    setAdjuntos([]);
  }, [conversacionId]);

  const enviar = async () => {
    if (!conversacionId || (!texto.trim() && adjuntos.length === 0)) return;
    setEnviando(true);
    try {
      await chatService.enviarMensaje(conversacionId, texto, adjuntos);
      setTexto('');
      setAdjuntos([]);
    } finally {
      setEnviando(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <div>
      <AsesoriasHeader />
      <Card className="flex h-[calc(100vh-17rem)] min-h-[28rem] overflow-hidden">
        {/* Lista de conversaciones */}
        <aside className={cn('flex w-full flex-col border-r border-slate-200 md:w-80', conversacionId && 'hidden md:flex')}>
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Buscar conversación…" className="form-control pl-9" aria-label="Buscar conversación" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && conversaciones.length === 0 ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : filtradas.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">No hay conversaciones.</p>
            ) : (
              filtradas.map((c) => (
                <Link
                  key={c.id}
                  to={`/asesorias/chat/${c.id}`}
                  className={cn('flex gap-3 border-b border-slate-50 px-3 py-3 hover:bg-slate-50', c.id === conversacionId && 'bg-brand-50/70 hover:bg-brand-50')}
                >
                  <Avatar nombre={c.asesorNombre} enLinea={c.asesorId === 'as-001' || c.asesorId === 'as-003'} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={cn('truncate text-sm', c.noLeidos ? 'font-semibold text-slate-900' : 'font-medium text-slate-800')}>{c.asesorNombre}</p>
                      <span className="shrink-0 text-[11px] text-slate-400">{tiempoRelativo(c.actualizada)}</span>
                    </div>
                    <p className="truncate text-xs text-slate-500">{c.asunto}</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('truncate text-xs', c.noLeidos ? 'text-slate-800' : 'text-slate-400')}>
                        {c.ultimoMensaje?.autor === 'usuario' && 'Tú: '}
                        {c.ultimoMensaje?.texto || (c.ultimoMensaje?.adjuntos.length ? '📎 Archivo adjunto' : '')}
                      </p>
                      {c.noLeidos > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">{c.noLeidos}</span>}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </aside>

        {/* Ventana de mensajes */}
        <section className={cn('flex min-w-0 flex-1 flex-col bg-slate-50', !conversacionId && 'hidden md:flex')}>
          {!conversacionId || !actual ? (
            <EmptyState
              className="m-auto"
              icon={MessagesSquare}
              titulo={conversacionId ? 'Conversación no encontrada' : 'Selecciona una conversación'}
              descripcion="También puedes iniciar una nueva desde el perfil de un asesor."
              accion={<ButtonLink to="/asesorias" variant="outline">Ver asesores</ButtonLink>}
            />
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
                <button onClick={() => navigate('/asesorias/chat')} className="rounded p-1 text-slate-500 hover:bg-slate-100 md:hidden" aria-label="Volver">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar nombre={actual.asesorNombre} enLinea={actual.asesorId === 'as-001' || actual.asesorId === 'as-003'} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{actual.asesorNombre}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                    {actual.proyectoId && <FolderKanban className="h-3 w-3" />}
                    {actual.asunto}
                  </p>
                </div>
                <Link to={`/asesorias/asesores/${actual.asesorId}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Ver perfil" aria-label="Ver perfil">
                  <UserRound className="h-5 w-5" />
                </Link>
                <ButtonLink to={`/asesorias/asesores/${actual.asesorId}/agendar${actual.proyectoId ? `?proyecto=${actual.proyectoId}` : ''}`} size="sm" variant="secondary" icon={CalendarPlus}>
                  <span className="hidden sm:inline">Agendar</span>
                </ButtonLink>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
                {mensajes.map((m, i) => {
                  const nuevoDia = i === 0 || formatFecha(m.fecha) !== formatFecha(mensajes[i - 1]!.fecha);
                  return (
                    <div key={m.id} className="space-y-4">
                      {nuevoDia && (
                        <p className="text-center">
                          <span className="rounded-full bg-white px-3 py-1 text-[11px] text-slate-500 ring-1 ring-slate-200">{formatFecha(m.fecha)}</span>
                        </p>
                      )}
                      <Burbuja m={m} asesorNombre={actual.asesorNombre} />
                    </div>
                  );
                })}
                {escribiendo && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Avatar nombre={actual.asesorNombre} size="xs" />
                    <span className="flex gap-1 rounded-2xl bg-white px-3 py-2.5 ring-1 ring-slate-200">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                    </span>
                    escribiendo…
                  </div>
                )}
                <div ref={finRef} />
              </div>

              <footer className="border-t border-slate-200 bg-white p-3">
                {adjuntos.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {adjuntos.map((f, i) => (
                      <span key={`${f.name}-${i}`} className="inline-flex max-w-[14rem] items-center gap-1.5 rounded-lg bg-slate-100 py-1 pl-2 pr-1 text-xs text-slate-700">
                        <Paperclip className="h-3 w-3 shrink-0" />
                        <span className="truncate">{f.name}</span>
                        <button onClick={() => setAdjuntos((a) => a.filter((_, j) => j !== i))} className="rounded p-0.5 hover:bg-slate-200" aria-label="Quitar adjunto">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <button onClick={() => fileRef.current?.click()} className="rounded-lg p-2.5 text-slate-500 hover:bg-slate-100" aria-label="Adjuntar archivo" title="Adjuntar archivo">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      setAdjuntos((a) => [...a, ...Array.from(e.target.files ?? [])]);
                      e.target.value = '';
                    }}
                  />
                  <textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                    placeholder="Escribe un mensaje… (Enter para enviar, Shift+Enter para salto de línea)"
                    className="form-control max-h-32 min-h-[42px] flex-1 resize-none"
                    aria-label="Mensaje"
                  />
                  <button
                    onClick={enviar}
                    disabled={enviando || (!texto.trim() && adjuntos.length === 0)}
                    className="rounded-lg bg-brand-700 p-2.5 text-white hover:bg-brand-800 disabled:opacity-40"
                    aria-label="Enviar"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </footer>
            </>
          )}
        </section>
      </Card>
    </div>
  );
}
