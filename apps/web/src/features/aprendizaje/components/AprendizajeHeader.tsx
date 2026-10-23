import { GraduationCap, Library, PlayCircle, Settings2 } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import { ButtonLink, TabsNav } from '@/components/ui';

/** Encabezado común de Biblioteca y Videos, con acceso de administración para el admin. */
export function AprendizajeHeader() {
  const { esAdmin } = useAuth();
  return (
    <>
      <PageHeader
        titulo="Aprendizaje"
        descripcion="Pliegos técnicos RIC, normativa asociada y material audiovisual de apoyo."
        icon={GraduationCap}
        acciones={
          esAdmin && (
            <ButtonLink to="/admin/contenidos" variant="outline" icon={Settings2}>
              Gestionar contenidos
            </ButtonLink>
          )
        }
      />
      <div className="mb-6">
        <TabsNav
          items={[
            { to: '/aprendizaje', label: 'Biblioteca normativa', icon: Library, end: true },
            { to: '/aprendizaje/videos', label: 'Videos y material de apoyo', icon: PlayCircle },
          ]}
        />
      </div>
    </>
  );
}
