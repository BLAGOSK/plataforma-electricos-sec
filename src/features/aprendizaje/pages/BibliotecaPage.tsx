import { useNavigate } from 'react-router-dom';
import { CalendarDays, Download, Eye, FileSearch } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { useTiposTE } from '@/hooks/useTiposTE';
import { aprendizajeService } from '@/services/aprendizajeService';
import { descargarArchivo } from '@/services/archivos';
import { useVersion } from '@/services/eventos';
import { formatFecha } from '@/utils/format';
import { ReferencialAviso } from '@/components/ReferencialAviso';
import { Button, ButtonLink, Card, Cargando, EmptyState } from '@/components/ui';
import { AprendizajeHeader } from '../components/AprendizajeHeader';
import { FiltrosAprendizaje } from '../components/FiltrosAprendizaje';
import { TETags } from '../components/TETags';
import { categoriasNormativa, infoCategoriaNormativa } from '../constantes';
import { useFiltrosUrl } from '../useFiltrosUrl';

export function BibliotecaPage() {
  const navigate = useNavigate();
  const f = useFiltrosUrl();
  const { tipos, porId } = useTiposTE();
  const version = useVersion('contenidos');

  const { data: documentos, loading } = useAsync(
    () => aprendizajeService.listarDocumentos({ q: f.q, tipoTEId: f.tipoTEId || undefined, categoria: f.categoria || undefined }),
    [f.q, f.tipoTEId, f.categoria, version],
  );

  return (
    <div>
      <AprendizajeHeader />
      <ReferencialAviso>
        Los documentos de la biblioteca son archivos de ejemplo. Consulta siempre la versión oficial publicada por la SEC.
      </ReferencialAviso>
      <div className="mt-6">
        <FiltrosAprendizaje
          busqueda={f.busqueda}
          onBusqueda={f.setBusqueda}
          tipoTEId={f.tipoTEId}
          onTipoTE={f.setTipoTE}
          categoria={f.categoria}
          onCategoria={f.setCategoria}
          categorias={categoriasNormativa}
          tipos={tipos}
          onLimpiar={f.limpiar}
          placeholder="Buscar por número, título o contenido…"
        />
      </div>

      {loading && !documentos ? (
        <Cargando />
      ) : !documentos?.length ? (
        <Card>
          <EmptyState icon={FileSearch} titulo="No se encontraron documentos" descripcion="Prueba con otros filtros o términos de búsqueda." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {documentos.map((d) => {
            const cat = infoCategoriaNormativa[d.categoria];
            return (
              <Card key={d.id} className="flex flex-col p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                      <cat.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{d.codigo}</p>
                      <p className="text-xs text-slate-500">{cat.label}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">{d.version}</span>
                </div>
                <h3 className="mt-3 line-clamp-2 font-semibold text-slate-900">{d.titulo}</h3>
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">{d.descripcion}</p>
                <div className="mt-4 space-y-3">
                  <TETags ids={d.tiposTE} porId={porId} enlazarA="/aprendizaje" />
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" /> {formatFecha(d.fecha)}
                  </p>
                  <div className="flex gap-2 border-t border-slate-100 pt-3">
                    <ButtonLink to={`/aprendizaje/pliegos/${d.id}`} size="sm" variant="secondary" icon={Eye} className="flex-1">
                      Ver
                    </ButtonLink>
                    <Button size="sm" variant="outline" icon={Download} className="flex-1" onClick={() => descargarArchivo(d.archivo)}>
                      Descargar
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {documentos && documentos.length > 0 && (
        <p className="mt-4 text-xs text-slate-500">
          {documentos.length} documento(s) ·{' '}
          <button className="text-brand-700 hover:underline" onClick={() => navigate('/aprendizaje/videos')}>
            ver también videos y material de apoyo
          </button>
        </p>
      )}
    </div>
  );
}
