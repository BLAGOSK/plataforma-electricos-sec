import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Download, Eye, FilePlus2, FileSearch, User } from 'lucide-react';
import { archivoDisponible, descargarArchivo } from '@/services/archivos';
import type { ArchivoAdjunto } from '@/types/common';
import { cn } from '@/utils/cn';
import { formatBytes, formatFechaHora } from '@/utils/format';
import { FilePreview } from '@/components/FilePreview';
import { VisorArchivoModal } from '@/components/VisorArchivoModal';
import { Badge, Button, ButtonLink, Card, CardBody, CardHeader, EmptyState } from '@/components/ui';
import { infoCategoria } from '../constantes';
import { useProyectoDetalle } from '../context';
import { NuevaRevisionModal } from '../components/NuevaRevisionModal';

export function DocumentoHistorialPage() {
  const { docId } = useParams();
  const { documentos, tipoTE, soloLectura } = useProyectoDetalle();
  const [subiendo, setSubiendo] = useState(false);
  const [visor, setVisor] = useState<{ archivo: ArchivoAdjunto; titulo: string } | null>(null);

  const documento = documentos.find((d) => d.id === docId);

  if (!documento) {
    return (
      <Card>
        <EmptyState icon={FileSearch} titulo="Documento no encontrado" accion={<ButtonLink to=".." relative="path" variant="outline">Volver a documentos</ButtonLink>} />
      </Card>
    );
  }

  const vigente = documento.revisiones.at(-1)!;
  const historial = [...documento.revisiones].reverse();
  const requisito = tipoTE?.documentosRequeridos.find((r) => r.id === documento.requisitoId);
  const categoria = infoCategoria[documento.categoria];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to=".." relative="path" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" /> Volver a documentos
          </Link>
          <h2 className="text-lg font-semibold text-slate-900">{documento.nombre}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Badge icon={categoria.icon}>{categoria.label}</Badge>
            {requisito && <Badge color="green">Cumple: {requisito.nombre}</Badge>}
            <span>Nomenclatura: {documento.esquemaRevision === 'letras' ? 'Rev. A, B, C…' : 'Rev. 0, 1, 2…'}</span>
          </div>
        </div>
        {!soloLectura && (
          <Button icon={FilePlus2} onClick={() => setSubiendo(true)}>
            Subir nueva revisión
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <Card className="ring-2 ring-emerald-500/30">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                Revisión vigente <Badge color="green" icon={CheckCircle2}>Rev. {vigente.numero}</Badge>
              </span>
            }
            description={`${vigente.archivo.nombre} · ${formatBytes(vigente.archivo.tamano)} · ${formatFechaHora(vigente.fecha)}`}
            actions={
              <Button size="sm" variant="outline" icon={Download} onClick={() => descargarArchivo(vigente.archivo)} disabled={!archivoDisponible(vigente.archivo)}>
                Descargar
              </Button>
            }
          />
          <CardBody>
            <FilePreview archivo={vigente.archivo} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Historial de revisiones" description={`${documento.revisiones.length} revisión(es)`} />
          <CardBody>
            <ol className="relative space-y-5">
              {historial.map((r, i) => {
                const esVigente = r.id === vigente.id;
                return (
                  <li key={r.id} className="relative flex gap-3">
                    {i < historial.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-slate-200" />}
                    <span
                      className={cn(
                        'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        esVigente ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      {r.numero}
                    </span>
                    <div className={cn('min-w-0 flex-1 rounded-lg border p-3', esVigente ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200')}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">Rev. {r.numero}</p>
                        {esVigente ? <Badge color="green">Vigente</Badge> : <Badge color="gray">Reemplazada</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{r.comentario}</p>
                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                        <User className="h-3 w-3" /> {r.autorNombre} · {formatFechaHora(r.fecha)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-xs text-slate-500">{r.archivo.nombre}</span>
                        <button
                          onClick={() => setVisor({ archivo: r.archivo, titulo: `${documento.nombre} · Rev. ${r.numero}` })}
                          className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                          aria-label={`Ver Rev. ${r.numero}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => descargarArchivo(r.archivo)}
                          disabled={!archivoDisponible(r.archivo)}
                          className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-40"
                          aria-label={`Descargar Rev. ${r.numero}`}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardBody>
        </Card>
      </div>

      <NuevaRevisionModal documento={subiendo ? documento : null} onClose={() => setSubiendo(false)} />
      <VisorArchivoModal archivo={visor?.archivo ?? null} titulo={visor?.titulo} onClose={() => setVisor(null)} />
    </div>
  );
}
