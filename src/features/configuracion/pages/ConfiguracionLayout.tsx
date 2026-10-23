import { Outlet } from 'react-router-dom';
import { Bell, KeyRound, Settings, User } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { TabsNav } from '@/components/ui';

export function ConfiguracionLayout() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader titulo="Configuración" descripcion="Administra tu perfil, seguridad y preferencias." icon={Settings} />
      <div className="mb-6">
        <TabsNav
          items={[
            { to: 'perfil', label: 'Perfil', icon: User },
            { to: 'password', label: 'Contraseña', icon: KeyRound },
            { to: 'notificaciones', label: 'Notificaciones', icon: Bell },
          ]}
        />
      </div>
      <Outlet />
    </div>
  );
}
