import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, UserCog, Users } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { useDebounce } from '@/hooks/useDebounce';
import { adminService } from '@/services/adminService';
import { useVersion } from '@/services/eventos';
import type { EstadoUsuario } from '@/types/usuario';
import { estadosUsuario } from '@/utils/estados';
import { cn } from '@/utils/cn';
import { formatFecha } from '@/utils/format';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar, Badge, Card, Cargando, EmptyState, Table, TBody, Td, Th, THead, Tr } from '@/components/ui';

const estados = Object.keys(estadosUsuario) as EstadoUsuario[];

export function UsuariosPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const estado = (params.get('estado') ?? '') as EstadoUsuario | '';
  const [busqueda, setBusqueda] = useState('');
  const q = useDebounce(busqueda, 250);
  const version = useVersion('usuarios');

  const { data: conteo } = useAsync(() => adminService.contarUsuariosPorEstado(), [version]);
  const { data: usuarios, loading } = useAsync(() => adminService.listarUsuarios({ q, estado: estado || undefined }), [q, estado, version]);
  const total = conteo ? Object.values(conteo).reduce((a, b) => a + b, 0) : 0;

  return (
    <div>
      <PageHeader titulo="Usuarios" descripcion="Valida los certificados SEC y gestiona el acceso de los instaladores." icon={UserCog} />

      <div className="scrollbar-thin mb-4 flex gap-2 overflow-x-auto pb-1">
        {[{ value: '' as const, label: 'Todos', n: total }, ...estados.map((e) => ({ value: e, label: estadosUsuario[e].label, n: conteo?.[e] ?? 0 }))].map((f) => (
          <button
            key={f.value || 'todos'}
            onClick={() => setParams(f.value ? { estado: f.value } : {}, { replace: true })}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              estado === f.value ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
            )}
          >
            {f.label}
            <span className={cn('rounded-full px-1.5 text-xs', estado === f.value ? 'bg-white/20' : f.value === 'pendiente' && f.n > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100')}>
              {f.n}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <div className="border-b border-slate-100 p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, RUT, correo o licencia…"
              className="form-control pl-9"
              aria-label="Buscar usuarios"
            />
          </div>
        </div>
        {loading && !usuarios ? (
          <Cargando />
        ) : !usuarios?.length ? (
          <EmptyState icon={Users} titulo="No hay usuarios con estos filtros" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Usuario</Th>
                <Th>RUT</Th>
                <Th>Licencia SEC</Th>
                <Th>Rol</Th>
                <Th>Estado</Th>
                <Th>Registro</Th>
              </tr>
            </THead>
            <TBody>
              {usuarios.map((u) => (
                <Tr key={u.id} className="cursor-pointer" onClick={() => navigate(`/admin/usuarios/${u.id}`)}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar nombre={u.nombre} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{u.nombre}</p>
                        <p className="truncate text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap">{u.rut}</Td>
                  <Td className="whitespace-nowrap">{u.licencia ? `${u.licencia.numero} · ${u.licencia.clase}` : '—'}</Td>
                  <Td>{u.rol === 'admin' ? <Badge color="purple">Admin</Badge> : <Badge color="brand">Eléctrico</Badge>}</Td>
                  <Td>
                    <StatusBadge dominio="usuario" estado={u.estado} />
                  </Td>
                  <Td className="whitespace-nowrap text-slate-500">{formatFecha(u.fechaRegistro)}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
