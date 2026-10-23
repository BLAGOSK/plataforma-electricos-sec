import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileStack, GitCommitVertical, History, Layers } from 'lucide-react';
import type { ArchivoAdjunto } from '@/types/common';
import type { Documento } from '@/types/documento';
import { formatFecha } from '@/utils/format';
import { VisorArchivoModal } from '@/components/VisorArchivoModal';
import { Badge, Card, CardHeader, EmptyState, Table, TBody, Td, Th, THead, Tr } from '@/components/ui';
import { infoCategoria } from '../../constantes';
import { useProyectoDetalle } from '../../context';
import { DocumentoAcciones } from '../DocumentoAcciones';
import { NuevaRevisionModal } from '../NuevaRevisionModal';

function Indicador({ icon: Icon, valor, label }: { icon: typeof Layers; valor: number; label: string }) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <span className="rounded-lg bg-brand-50 p-2.5 text-brand-700">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-bold text-slate-900">{valor}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </Card>
  );
}

export function ControlDocumentalTab() {
  const { documentos, soloLectura } = useProyectoDetalle();
  const navigate = useNavigate();
  const [docRevision, setDocRevision] = useState<Documento | null>(null);
  const [visor, setVisor] = useState<{ archivo: ArchivoAdjunto; titulo: string } | null>(null);

  const totalRevisiones = documentos.reduce((n, d) => n + d.revisiones.length, 0);
  const hace30 = Date.now() - 30 * 86_400_000;
  const recientes = documentos.filter((d) => new Date(d.revisiones.at(-1)!.fecha).getTime() > hace30).length;

  const ordenados = [...documentos].sort((a, b) => b.revisiones.at(-1)!.fecha.localeCompare(a.revisiones.at(-1)!.fecha));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Indicador icon={FileStack} valor={documentos.length} label="Documentos controlados" />
        <Indicador icon={Layers} valor={totalRevisiones} label="Revisiones emitidas" />
        <Indicador icon={GitCommitVertical} valor={recientes} label="Modificados en los últimos 30 días" />
      </div>

      <Card>
        <CardHeader
          title="Registro de control documental"
          description="Cada documento mantiene su historial de revisiones. La revisión más reciente es la vigente."
        />
        {documentos.length === 0 ? (
          <EmptyState icon={History} titulo="Sin documentos controlados" descripcion="Los documentos que cargues aparecerán aquí con su historial de revisiones." />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Documento</Th>
                <Th>Categoría</Th>
                <Th>Rev. vigente</Th>
                <Th>Historial</Th>
                <Th>Última emisión</Th>
                <Th>Autor</Th>
                <Th className="sr-only">Acciones</Th>
              </tr>
            </THead>
            <TBody>
              {ordenados.map((d) => {
                const vigente = d.revisiones.at(-1)!;
                return (
                  <Tr key={d.id} className="cursor-pointer" onClick={() => navigate(`../documentos/${d.id}`)}>
                    <Td className="max-w-xs">
                      <p className="truncate font-medium text-slate-900">{d.nombre}</p>
                      <p className="truncate text-xs text-slate-500">{vigente.comentario}</p>
                    </Td>
                    <Td className="whitespace-nowrap">{infoCategoria[d.categoria].label}</Td>
                    <Td>
                      <Badge color="green">Rev. {vigente.numero}</Badge>
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {d.revisiones.map((r) => (
                          <span
                            key={r.id}
                            className={
                              r.id === vigente.id
                                ? 'rounded bg-emerald-600 px-1.5 text-xs font-semibold text-white'
                                : 'rounded bg-slate-100 px-1.5 text-xs text-slate-500 line-through decoration-slate-300'
                            }
                          >
                            {r.numero}
                          </span>
                        ))}
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap text-slate-500">{formatFecha(vigente.fecha)}</Td>
                    <Td className="whitespace-nowrap">{vigente.autorNombre}</Td>
                    <Td>
                      <DocumentoAcciones
                        documento={d}
                        soloLectura={soloLectura}
                        rutaHistorial={`../documentos/${d.id}`}
                        onVer={() => setVisor({ archivo: vigente.archivo, titulo: `${d.nombre} · Rev. ${vigente.numero}` })}
                        onNuevaRevision={() => setDocRevision(d)}
                      />
                    </Td>
                  </Tr>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>

      <NuevaRevisionModal documento={docRevision} onClose={() => setDocRevision(null)} />
      <VisorArchivoModal archivo={visor?.archivo ?? null} titulo={visor?.titulo} onClose={() => setVisor(null)} />
    </div>
  );
}
