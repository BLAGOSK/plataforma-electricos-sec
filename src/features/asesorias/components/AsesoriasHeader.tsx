import { CalendarDays, MessagesSquare, Users } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { TabsNav } from '@/components/ui';
import type { ReactNode } from 'react';

export function AsesoriasHeader({ acciones }: { acciones?: ReactNode }) {
  return (
    <>
      <PageHeader
        titulo="Asesorías"
        descripcion="Conecta con profesionales expertos para resolver dudas técnicas de tus proyectos."
        icon={Users}
        acciones={acciones}
      />
      <div className="mb-6">
        <TabsNav
          items={[
            { to: '/asesorias', label: 'Asesores', icon: Users, end: true },
            { to: '/asesorias/reuniones', label: 'Mis reuniones', icon: CalendarDays },
            { to: '/asesorias/chat', label: 'Mensajes', icon: MessagesSquare },
          ]}
        />
      </div>
    </>
  );
}
