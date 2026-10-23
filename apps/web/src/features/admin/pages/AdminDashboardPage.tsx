import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, ClipboardCheck, FileText, FolderKanban, LayoutDashboard, PlayCircle, UserCheck, type LucideIcon } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { adminService } from '@/services/adminService';
import { useVersion } from '@/services/eventos';
import { estadosProyecto, flujoProyecto } from '@/utils/estados';
import { formatFecha, tiempoRelativo } from '@/utils/format';
import { PageHeader } from '@/components/PageHeader';
import { Alert, Avatar, Card, CardBody, CardHeader, Cargando, EmptyState } from '@/components/ui';
import { BarrasHorizontales, Columnas } from '../components/BarrasHorizontales';

function Kpi({ label, valor, icon: Icon, to, alerta }: { label: string; valor: number; icon: LucideIcon; to: string; alerta?: boolean }) {
  return (
    <Link to={to} className="group">
      <Card className="flex h-full items-center gap-4 p-5 transition-shadow group-hover:shadow-md">
        <span className={alerta ? 'rounded-xl bg-amber-50 p-3 text-amber-600' : 'rounded-xl bg-brand-50 p-3 text-brand-700'}>
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-3xl font-bold tabular-nums text-slate-900">{valor}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </Card>
    </Link>
  );
}

export function AdminDashboardPage() {
  const vU = useVersion('usuarios');
  const vE = useVersion('extensiones');
  const vC = useVersion('contenidos');
  const { data: m } = useAsync(() => adminService.metricas(), [vU, vE, vC]);
  const { data: pendientes = [] } = useAsync(() => adminService.listarUsuarios({ estado: 'pendiente' }), [vU]);
  const { data: solicitudes = [] } = useAsync(() => adminService.listarSolicitudesExtension(), [vE]);

  if (!m) return <Cargando />;
  const solPend = solicitudes.filter((s) => s.estado === 'pendiente');

  return (
    <div className="space-y-6">
      <PageHeader titulo="Panel de administración" descripcion="Resumen de la actividad de la plataforma." icon={LayoutDashboard} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Usuarios pendientes" valor={m.usuariosPorEstado.pendiente} icon={UserCheck} to="/admin/usuarios?estado=pendiente" alerta={m.usuariosPorEstado.pendiente > 0} />
        <Kpi label="Solicitudes de extensiones" valor={m.solicitudesPendientes} icon={ClipboardCheck} to="/admin/solicitudes-extensiones" alerta={m.solicitudesPendientes > 0} />
        <Kpi label="Proyectos registrados" valor={m.totalProyectos} icon={FolderKanban} to="/proyectos" />
        <Kpi label="Reuniones agendadas" valor={m.reunionesAgendadas} icon={CalendarDays} to="/admin/asesores" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Usuarios pendientes de validación"
            actions={
              <Link to="/admin/usuarios?estado=pendiente" className="text-sm font-medium text-brand-700 hover:text-brand-800">
                Ver todos
              </Link>
            }
          />
          {pendientes.length === 0 ? (
            <EmptyState icon={UserCheck} titulo="Sin cuentas pendientes" className="py-8" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {pendientes.slice(0, 5).map((u) => (
                <li key={u.id}>
                  <Link to={`/admin/usuarios/${u.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                    <Avatar nombre={u.nombre} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{u.nombre}</p>
                      <p className="truncate text-xs text-slate-500">
                        {u.rut} · Licencia {u.licencia?.numero} (clase {u.licencia?.clase})
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{tiempoRelativo(u.fechaRegistro)}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Solicitudes de extensiones"
            actions={
              <Link to="/admin/solicitudes-extensiones" className="text-sm font-medium text-brand-700 hover:text-brand-800">
                Gestionar
              </Link>
            }
          />
          {solPend.length === 0 ? (
            <EmptyState icon={ClipboardCheck} titulo="Sin solicitudes pendientes" className="py-8" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {solPend.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <Link to="/admin/solicitudes-extensiones" className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                    <Avatar nombre={s.usuarioNombre} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{s.extensionNombre}</p>
                      <p className="truncate text-xs text-slate-500">{s.usuarioNombre}</p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{formatFecha(s.fechaSolicitud)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Alert tipo="info">Las métricas combinan los datos simulados de la demo con valores de ejemplo.</Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Proyectos por estado" />
          <CardBody>
            <BarrasHorizontales datos={flujoProyecto.map((e) => ({ etiqueta: estadosProyecto[e].label, valor: m.proyectosPorEstado[e] }))} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Proyectos por tipo TE" />
          <CardBody>
            <BarrasHorizontales datos={m.proyectosPorTipo.map((t) => ({ etiqueta: t.codigo, valor: t.total, detalle: `${t.codigo} — ${t.nombre}` }))} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Nuevos registros por mes" />
          <CardBody>
            <Columnas datos={m.registrosPorMes.map((r) => ({ etiqueta: r.mes, valor: r.total }))} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Contenido reciente"
          actions={
            <Link to="/admin/contenidos" className="text-sm font-medium text-brand-700 hover:text-brand-800">
              Gestionar contenidos
            </Link>
          }
        />
        <ul className="divide-y divide-slate-100">
          {m.contenidoReciente.map((c) => (
            <li key={c.id}>
              <Link to={c.to} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                {c.tipo === 'video' ? <PlayCircle className="h-4 w-4 shrink-0 text-violet-600" /> : <FileText className="h-4 w-4 shrink-0 text-emerald-600" />}
                <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{c.titulo}</span>
                <span className="shrink-0 text-xs text-slate-400">{formatFecha(c.fecha)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
