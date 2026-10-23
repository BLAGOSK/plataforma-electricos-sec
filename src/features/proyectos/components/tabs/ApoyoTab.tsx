import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink, FileText, ListChecks, MessagesSquare, PlayCircle, Puzzle } from 'lucide-react';
import { proyectosService } from '@/services/proyectosService';
import type { MaterialApoyo } from '@/types/tipoTE';
import { cn } from '@/utils/cn';
import { ReferencialAviso } from '@/components/ReferencialAviso';
import { ButtonLink, Card, CardBody, CardHeader, Checkbox, EmptyState } from '@/components/ui';
import { useProyectoDetalle } from '../../context';
import { ChecklistTE } from '../ChecklistTE';
import { ProgresoDocumental } from '../ProgresoDocumental';
import { PliegoRicLink } from '../PliegoRicLink';

const iconosMaterial: Record<MaterialApoyo['tipo'], typeof FileText> = {
  video: PlayCircle,
  documento: FileText,
  enlace: ExternalLink,
};

export function ApoyoTab() {
  const { proyecto, tipoTE, documentos, soloLectura } = useProyectoDetalle();
  const [checklist, setChecklist] = useState<string[]>(proyecto.checklistApoyo);

  useEffect(() => setChecklist(proyecto.checklistApoyo), [proyecto.checklistApoyo]);

  if (!tipoTE) {
    return (
      <Card>
        <EmptyState icon={BookOpen} titulo="Sin material de apoyo" descripcion="El tipo TE de este proyecto ya no existe en el catálogo." />
      </Card>
    );
  }

  const alternar = async (id: string) => {
    setChecklist(await proyectosService.alternarRequisito(proyecto.id, id));
  };

  return (
    <div className="space-y-6">
      <ReferencialAviso>
        La guía, los requisitos y las referencias normativas del tipo {tipoTE.codigo} son de ejemplo y deben validarse contra la normativa SEC vigente.
      </ReferencialAviso>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title={`Guía de declaración ${tipoTE.codigo}`} description={tipoTE.nombre} />
            <CardBody>
              <ol className="space-y-0">
                {tipoTE.guia.map((p, i) => (
                  <li key={p.titulo} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < tipoTE.guia.length - 1 && <span className="absolute left-4 top-8 h-full w-px bg-brand-100" />}
                    <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div className="pt-1">
                      <p className="font-semibold text-slate-900">{p.titulo}</p>
                      <p className="mt-0.5 text-sm text-slate-600">{p.descripcion}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Pliegos técnicos RIC aplicables"
              description="Normativa de referencia para este tipo de declaración"
              actions={
                <Link to={`/aprendizaje?te=${tipoTE.id}`} className="text-sm font-medium text-brand-700 hover:text-brand-800">
                  Ver en Aprendizaje
                </Link>
              }
            />
            <CardBody className="grid gap-3 sm:grid-cols-2">
              {tipoTE.pliegosRic.map((id) => (
                <PliegoRicLink key={id} pliegoId={id} />
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Documentos requeridos" />
            <CardBody>
              <ChecklistTE tipoTE={tipoTE} documentos={documentos} compacto />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Checklist de requisitos" description="Marca lo que ya verificaste" />
            <CardBody className="space-y-4">
              <ProgresoDocumental cargados={checklist.length} requeridos={tipoTE.requisitos.length} compacto />
              <div className="space-y-3">
                {tipoTE.requisitos.map((r) => (
                  <Checkbox
                    key={r.id}
                    checked={checklist.includes(r.id)}
                    onChange={() => alternar(r.id)}
                    disabled={soloLectura}
                    label={<span className={cn(checklist.includes(r.id) && 'text-slate-500 line-through')}>{r.texto}</span>}
                  />
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Material de apoyo" />
            {tipoTE.materialApoyo.length === 0 ? (
              <CardBody className="text-sm text-slate-500">No hay material asociado a este tipo TE.</CardBody>
            ) : (
              <ul className="divide-y divide-slate-100">
                {tipoTE.materialApoyo.map((m) => {
                  const Icon = iconosMaterial[m.tipo];
                  const externo = m.to.startsWith('http');
                  const contenido = (
                    <>
                      <Icon className="h-4 w-4 shrink-0 text-brand-600" />
                      <span className="flex-1">{m.titulo}</span>
                      {externo && <ExternalLink className="h-3.5 w-3.5 text-slate-400" />}
                    </>
                  );
                  return (
                    <li key={m.titulo}>
                      {externo ? (
                        <a href={m.to} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50">
                          {contenido}
                        </a>
                      ) : (
                        <Link to={m.to} className="flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50">
                          {contenido}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card className="bg-brand-50/50">
            <CardBody className="space-y-3">
              <p className="flex items-center gap-2 font-semibold text-slate-900">
                <ListChecks className="h-5 w-5 text-brand-700" /> ¿Necesitas ayuda?
              </p>
              <p className="text-sm text-slate-600">Solicita una asesoría con un profesional experto en {tipoTE.codigo} o usa las herramientas de cálculo.</p>
              <div className="flex flex-col gap-2">
                <ButtonLink to={`/asesorias?proyecto=${proyecto.id}&te=${tipoTE.id}`} icon={MessagesSquare} size="sm">
                  Solicitar asesoría
                </ButtonLink>
                <ButtonLink to="/extensiones" variant="outline" icon={Puzzle} size="sm">
                  Herramientas de cálculo
                </ButtonLink>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
