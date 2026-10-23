import { useNavigate } from 'react-router-dom';
import { ChevronDown, Puzzle } from 'lucide-react';
import { useUsuario } from '@/features/auth/context/AuthContext';
import { iconosExtension } from '@/features/extensiones/iconos';
import { useAsync } from '@/hooks/useAsync';
import { extensionesService } from '@/services/extensionesService';
import { useVersion } from '@/services/eventos';
import { Button, Dropdown, DropdownItem } from '@/components/ui';

/** Abre una extensión activa con el proyecto como contexto (?proyecto=id). */
export function AbrirExtensionMenu({ proyectoId }: { proyectoId: string }) {
  const usuario = useUsuario();
  const navigate = useNavigate();
  const version = useVersion('extensiones');
  const { data: activas = [] } = useAsync(() => extensionesService.activas(usuario.id), [usuario.id, version]);

  return (
    <Dropdown
      className="w-72"
      trigger={({ alternar }) => (
        <Button variant="outline" icon={Puzzle} iconRight={ChevronDown} onClick={alternar}>
          Herramientas
        </Button>
      )}
    >
      {(cerrar) => (
        <div className="py-1">
          {activas.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">No tienes extensiones activas.</p>
          ) : (
            activas.map((e) => (
              <DropdownItem
                key={e.id}
                icon={iconosExtension[e.slug]}
                onClick={() => {
                  cerrar();
                  navigate(`/extensiones/${e.slug}?proyecto=${proyectoId}`);
                }}
              >
                {e.nombre}
              </DropdownItem>
            ))
          )}
          <div className="mt-1 border-t border-slate-100 pt-1">
            <DropdownItem
              icon={Puzzle}
              onClick={() => {
                cerrar();
                navigate('/extensiones');
              }}
            >
              Ver catálogo de extensiones
            </DropdownItem>
          </div>
        </div>
      )}
    </Dropdown>
  );
}
