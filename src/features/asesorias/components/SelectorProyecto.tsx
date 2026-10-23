import { useUsuario } from '@/features/auth/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { proyectosService } from '@/services/proyectosService';
import { Select } from '@/components/ui';

/** Select opcional para asociar una asesoría/reunión a uno de los proyectos del usuario. */
export function SelectorProyecto({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const usuario = useUsuario();
  const { data: proyectos = [] } = useAsync(() => proyectosService.listar(usuario), [usuario]);
  return (
    <Select
      label="Proyecto asociado"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Ninguno (consulta general)"
      opciones={proyectos.map((p) => ({ value: p.id, label: `${p.codigo} · ${p.nombre}` }))}
      hint="Opcional. El asesor podrá ver el contexto del proyecto."
    />
  );
}
