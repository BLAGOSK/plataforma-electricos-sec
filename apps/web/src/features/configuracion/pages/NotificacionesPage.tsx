import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { authService } from '@/services/authService';
import type { PreferenciasNotificacion } from '@/types/usuario';
import { Button, Card, CardBody, CardFooter, CardHeader, Cargando, Switch, useToast } from '@/components/ui';

const grupos: Array<{ titulo: string; descripcion: string; items: Array<{ clave: keyof PreferenciasNotificacion; label: string; descripcion: string }> }> = [
  {
    titulo: 'Correo electrónico',
    descripcion: 'Se enviarán a tu correo registrado.',
    items: [
      { clave: 'emailProyectos', label: 'Proyectos', descripcion: 'Cambios de estado y recordatorios de documentación pendiente.' },
      { clave: 'emailAsesorias', label: 'Asesorías', descripcion: 'Confirmaciones de reuniones y respuestas de asesores.' },
      { clave: 'emailExtensiones', label: 'Extensiones', descripcion: 'Resolución de solicitudes de activación.' },
      { clave: 'emailNovedades', label: 'Novedades', descripcion: 'Nuevos pliegos, videos y actualizaciones normativas.' },
    ],
  },
  {
    titulo: 'En la plataforma',
    descripcion: 'Se muestran en la campana de notificaciones.',
    items: [
      { clave: 'appMensajes', label: 'Mensajes de chat', descripcion: 'Avisar cuando un asesor te escribe.' },
      { clave: 'appRecordatorios', label: 'Recordatorios de reuniones', descripcion: 'Aviso 24 horas y 15 minutos antes.' },
    ],
  },
];

export function NotificacionesPage() {
  const usuario = useUsuario();
  const toast = useToast();
  const { data, loading } = useAsync(() => authService.obtenerPreferencias(usuario.id), [usuario.id]);
  const [prefs, setPrefs] = useState<PreferenciasNotificacion | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (data) setPrefs(data);
  }, [data]);

  if (loading || !prefs) return <Cargando />;

  const guardar = async () => {
    setGuardando(true);
    await authService.guardarPreferencias(usuario.id, prefs);
    setGuardando(false);
    toast.exito('Preferencias guardadas');
  };

  return (
    <Card>
      {grupos.map((g) => (
        <div key={g.titulo} className="border-b border-slate-100 last:border-0">
          <CardHeader title={g.titulo} description={g.descripcion} className="border-0 pb-0" />
          <CardBody className="space-y-4">
            {g.items.map((it) => (
              <Switch key={it.clave} label={it.label} descripcion={it.descripcion} checked={prefs[it.clave]} onChange={(v) => setPrefs({ ...prefs, [it.clave]: v })} />
            ))}
          </CardBody>
        </div>
      ))}
      <CardFooter>
        <Button icon={Save} onClick={guardar} loading={guardando}>
          Guardar preferencias
        </Button>
      </CardFooter>
    </Card>
  );
}
