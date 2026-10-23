import { Link } from 'react-router-dom';
import { CalendarDays, FolderKanban, MessagesSquare, Video } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { asesoriasService } from '@/services/asesoriasService';
import { chatService } from '@/services/chatService';
import { proyectosService } from '@/services/proyectosService';
import { formatFechaHora } from '@/utils/format';
import { Card } from '@/components/ui';

/** Resumen de actividad del usuario en sesión (proyectos, reuniones, mensajes). */
export function ResumenActividad() {
  const usuario = useUsuario();
  const { data } = useAsync(async () => {
    const [conteo, reuniones, conversaciones] = await Promise.all([
      proyectosService.contarPorEstado(usuario),
      asesoriasService.listarReuniones(usuario.id),
      chatService.listarConversaciones(usuario.id),
    ]);
    return {
      enCurso: conteo.en_desarrollo + conteo.borrador,
      listos: conteo.listo_para_declarar,
      proxima: reuniones.find((r) => r.estado === 'agendada'),
      noLeidos: conversaciones.reduce((n, c) => n + c.noLeidos, 0),
    };
  }, [usuario]);

  if (!data) return null;

  const items = [
    {
      to: '/proyectos?estado=en_desarrollo',
      icon: FolderKanban,
      titulo: `${data.enCurso} proyecto(s) en curso`,
      detalle: data.listos ? `${data.listos} listo(s) para declarar` : 'Sin proyectos listos para declarar',
    },
    {
      to: data.proxima?.modalidad === 'videollamada' ? `/asesorias/videollamada/${data.proxima.id}` : '/asesorias/reuniones',
      icon: data.proxima?.modalidad === 'videollamada' ? Video : CalendarDays,
      titulo: data.proxima ? `Próxima reunión: ${formatFechaHora(data.proxima.fechaInicio)}` : 'Sin reuniones agendadas',
      detalle: data.proxima ? `${data.proxima.tema} · ${data.proxima.asesorNombre}` : 'Agenda una asesoría con un experto',
    },
    {
      to: '/asesorias/chat',
      icon: MessagesSquare,
      titulo: data.noLeidos ? `${data.noLeidos} mensaje(s) sin leer` : 'Sin mensajes nuevos',
      detalle: 'Conversaciones con asesores',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map(({ to, icon: Icon, titulo, detalle }) => (
        <Link key={titulo} to={to} className="group">
          <Card className="flex h-full items-start gap-3 p-4 transition-shadow group-hover:shadow-md">
            <span className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900">{titulo}</span>
              <span className="block truncate text-xs text-slate-500">{detalle}</span>
            </span>
          </Card>
        </Link>
      ))}
    </div>
  );
}
