import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CircleCheck, FileUp, History, Lightbulb, Users } from 'lucide-react';
import { estadosProyecto, flujoProyecto } from '@/utils/estados';
import { formatFecha, formatFechaHora, formatNumero, tiempoRelativo } from '@/utils/format';
import { Card, CardBody, CardHeader, Stepper } from '@/components/ui';
import { useProyectoDetalle } from '../../context';
import { ProgresoDocumental } from '../ProgresoDocumental';

function Dato({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900">{children || '—'}</dd>
    </div>
  );
}

export function ResumenTab() {
  const { proyecto, tipoTE, documentos } = useProyectoDetalle();
  const indiceEstado = flujoProyecto.indexOf(proyecto.estado);

  const actividad = documentos
    .flatMap((d) => d.revisiones.map((r) => ({ ...r, documento: d })))
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 5);

  const faltantes = tipoTE?.documentosRequeridos.filter((r) => r.obligatorio && !documentos.some((d) => d.requisitoId === r.id)) ?? [];

  const sugerencias: Array<{ texto: string; to: string; icon: typeof FileUp }> = [];
  if (proyecto.estado !== 'declarado') {
    if (faltantes.length > 0) sugerencias.push({ texto: `Carga ${faltantes.length} documento(s) obligatorio(s) pendiente(s)`, to: '../documentos', icon: FileUp });
    else if (proyecto.estado !== 'listo_para_declarar') sugerencias.push({ texto: 'La documentación está completa: marca el proyecto como listo para declarar', to: '../apoyo', icon: CircleCheck });
    sugerencias.push({ texto: `Revisa la guía de declaración ${proyecto.tipoTECodigo}`, to: '../apoyo', icon: Lightbulb });
    sugerencias.push({ texto: '¿Dudas técnicas? Solicita una asesoría para este proyecto', to: `/asesorias?proyecto=${proyecto.id}`, icon: Users });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader title="Estado del proyecto" />
          <CardBody>
            <Stepper pasos={flujoProyecto.map((e) => ({ titulo: estadosProyecto[e].label }))} actual={proyecto.estado === 'declarado' ? flujoProyecto.length : indiceEstado} />
            {proyecto.estado === 'declarado' && (
              <p className="mt-4 text-center text-sm text-slate-600">
                Declarado el {formatFecha(proyecto.fechaDeclaracion!)} · Folio <span className="font-semibold">{proyecto.folioSec}</span>
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Datos generales" />
          <CardBody>
            {proyecto.descripcion && <p className="mb-5 text-sm text-slate-600">{proyecto.descripcion}</p>}
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Dato label="Cliente">{proyecto.cliente.nombre}</Dato>
              <Dato label="RUT cliente">{proyecto.cliente.rut}</Dato>
              <Dato label="Contacto">{[proyecto.cliente.email, proyecto.cliente.telefono].filter(Boolean).join(' · ')}</Dato>
              <Dato label="Dirección">{proyecto.direccion}</Dato>
              <Dato label="Comuna / región">
                {proyecto.comuna}, {proyecto.region}
              </Dato>
              <Dato label="Potencia declarada">{formatNumero(proyecto.potenciaKw, 1)} kW</Dato>
              <Dato label="Tipo de declaración">
                {proyecto.tipoTECodigo} — {proyecto.tipoTENombre}
              </Dato>
              <Dato label="Responsable">{proyecto.responsableNombre}</Dato>
              <Dato label="Creado / actualizado">
                {formatFecha(proyecto.fechaCreacion)} / {formatFecha(proyecto.fechaActualizacion)}
              </Dato>
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Actividad documental reciente"
            actions={
              <Link to="../control-documental" className="text-sm font-medium text-brand-700 hover:text-brand-800">
                Ver todo
              </Link>
            }
          />
          {actividad.length === 0 ? (
            <CardBody className="text-sm text-slate-500">Aún no se han cargado documentos.</CardBody>
          ) : (
            <ul className="divide-y divide-slate-100">
              {actividad.map((a) => (
                <li key={a.id}>
                  <Link to={`../documentos/${a.documento.id}`} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50">
                    <span className="mt-0.5 rounded-md bg-brand-50 p-1.5 text-brand-700">
                      <History className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-slate-900">
                        <span className="font-medium">{a.documento.nombre}</span> · Rev. {a.numero}
                      </span>
                      <span className="block truncate text-xs text-slate-500">{a.comentario}</span>
                    </span>
                    <span className="shrink-0 text-xs text-slate-400" title={formatFechaHora(a.fecha)}>
                      {tiempoRelativo(a.fecha)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader title="Documentación" />
          <CardBody className="space-y-4">
            <ProgresoDocumental cargados={proyecto.docsCargados} requeridos={proyecto.docsRequeridos} />
            <p className="text-sm text-slate-600">
              {proyecto.totalDocumentos} documento(s) en total ·{' '}
              {documentos.reduce((n, d) => n + d.revisiones.length, 0)} revisión(es)
            </p>
            {faltantes.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Pendientes</p>
                <ul className="space-y-1 text-sm text-slate-700">
                  {faltantes.map((f) => (
                    <li key={f.id} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {f.nombre}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link to="../documentos" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800">
              Ir a documentos <ArrowRight className="h-4 w-4" />
            </Link>
          </CardBody>
        </Card>

        {sugerencias.length > 0 && (
          <Card>
            <CardHeader title="Próximos pasos" />
            <ul className="divide-y divide-slate-100">
              {sugerencias.map((s) => (
                <li key={s.texto}>
                  <Link to={s.to} className="flex items-start gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50">
                    <s.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {s.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
