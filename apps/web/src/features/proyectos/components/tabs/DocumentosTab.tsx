import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus2, FolderOpen, Upload } from 'lucide-react';
import type { ArchivoAdjunto } from '@/types/common';
import type { CategoriaDocumento, Documento } from '@/types/documento';
import { cn } from '@/utils/cn';
import { formatFecha } from '@/utils/format';
import { FileDropzone } from '@/components/FileDropzone';
import { iconoArchivo } from '@/components/FilePreview';
import { VisorArchivoModal } from '@/components/VisorArchivoModal';
import { Badge, Button, Card, CardBody, CardHeader, EmptyState } from '@/components/ui';
import { ACCEPT_DOCUMENTOS, categoriasDocumento, FORMATOS_DOCUMENTOS } from '../../constantes';
import { useProyectoDetalle } from '../../context';
import { ChecklistTE } from '../ChecklistTE';
import { DocumentoAcciones } from '../DocumentoAcciones';
import { NuevaRevisionModal } from '../NuevaRevisionModal';
import { NuevoDocumentoModal, type PrefillDocumento } from '../NuevoDocumentoModal';

export function DocumentosTab() {
  const { proyecto, tipoTE, documentos, soloLectura } = useProyectoDetalle();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<CategoriaDocumento | ''>('');
  const [modalNuevo, setModalNuevo] = useState<PrefillDocumento | null>(null);
  const [docRevision, setDocRevision] = useState<Documento | null>(null);
  const [visor, setVisor] = useState<{ archivo: ArchivoAdjunto; titulo: string } | null>(null);

  const conteo = (c: CategoriaDocumento) => documentos.filter((d) => d.categoria === c).length;
  const categoriasVisibles = categoriasDocumento.filter((c) => (filtro ? c.value === filtro : conteo(c.value) > 0));
  const requisitos = tipoTE?.documentosRequeridos ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
      <div className="space-y-4">
        {!soloLectura && (
          <FileDropzone
            accept={ACCEPT_DOCUMENTOS}
            formatos={FORMATOS_DOCUMENTOS}
            maxMB={50}
            compacto
            onArchivos={([f]) => f && setModalNuevo({ archivo: f })}
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFiltro('')}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1 text-sm font-medium',
                !filtro ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
              )}
            >
              Todas ({documentos.length})
            </button>
            {categoriasDocumento.map((c) => (
              <button
                key={c.value}
                onClick={() => setFiltro(c.value)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium',
                  filtro === c.value ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                )}
              >
                <c.icon className="h-3.5 w-3.5" />
                {c.label} ({conteo(c.value)})
              </button>
            ))}
          </div>
          {!soloLectura && (
            <Button icon={Upload} onClick={() => setModalNuevo(filtro ? { categoria: filtro } : {})}>
              Subir documento
            </Button>
          )}
        </div>

        {categoriasVisibles.length === 0 || (filtro && conteo(filtro) === 0) ? (
          <Card>
            <EmptyState
              icon={FolderOpen}
              titulo={filtro ? 'Sin documentos en esta categoría' : 'Aún no hay documentos'}
              descripcion="Arrastra archivos a la zona de carga o usa el botón «Subir documento»."
              accion={
                !soloLectura && (
                  <Button variant="outline" icon={FilePlus2} onClick={() => setModalNuevo(filtro ? { categoria: filtro } : {})}>
                    Subir documento
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          categoriasVisibles.map((c) => (
            <Card key={c.value}>
              <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                <c.icon className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-semibold text-slate-900">{c.label}</h3>
                <span className="text-xs text-slate-400">({conteo(c.value)})</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {documentos
                  .filter((d) => d.categoria === c.value)
                  .map((d) => {
                    const vigente = d.revisiones.at(-1)!;
                    const Icon = iconoArchivo(vigente.archivo.tipoMime, vigente.archivo.nombre);
                    const req = requisitos.find((r) => r.id === d.requisitoId);
                    return (
                      <li
                        key={d.id}
                        onClick={() => navigate(d.id)}
                        className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-slate-50"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-medium text-slate-900">{d.nombre}</p>
                            <Badge color="green">Rev. {vigente.numero} vigente</Badge>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {vigente.archivo.nombre} · {d.revisiones.length} revisión(es) · {formatFecha(vigente.fecha)}
                            {req && <span className="text-emerald-700"> · Cumple: {req.nombre}</span>}
                          </p>
                        </div>
                        <DocumentoAcciones
                          documento={d}
                          soloLectura={soloLectura}
                          rutaHistorial={d.id}
                          onVer={() => setVisor({ archivo: vigente.archivo, titulo: `${d.nombre} · Rev. ${vigente.numero}` })}
                          onNuevaRevision={() => setDocRevision(d)}
                        />
                      </li>
                    );
                  })}
              </ul>
            </Card>
          ))
        )}
      </div>

      <div>
        <Card className="xl:sticky xl:top-20">
          <CardHeader title="Documentos requeridos" description={tipoTE ? `Según ${tipoTE.codigo} — ${tipoTE.nombre}` : undefined} />
          <CardBody>
            {tipoTE ? (
              <ChecklistTE tipoTE={tipoTE} documentos={documentos} onCargar={soloLectura ? undefined : (r) => setModalNuevo({ requisito: r })} />
            ) : (
              <p className="text-sm text-slate-500">El tipo TE de este proyecto ya no existe en el catálogo.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <NuevoDocumentoModal
        abierto={!!modalNuevo}
        onClose={() => setModalNuevo(null)}
        proyectoId={proyecto.id}
        requisitos={requisitos}
        prefill={modalNuevo ?? undefined}
      />
      <NuevaRevisionModal documento={docRevision} onClose={() => setDocRevision(null)} />
      <VisorArchivoModal archivo={visor?.archivo ?? null} titulo={visor?.titulo} onClose={() => setVisor(null)} />
    </div>
  );
}
