import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import type { DocumentoNormativo } from '@/types/aprendizaje';

/** Enlace a un pliego técnico o documento normativo del apartado de Aprendizaje. */
export function PliegoRicLink({ documento }: { documento: Pick<DocumentoNormativo, 'id' | 'codigo' | 'titulo'> }) {
  return (
    <Link
      to={`/aprendizaje/pliegos/${documento.id}`}
      className="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
    >
      <span className="rounded-md bg-emerald-50 p-2 text-emerald-700">
        <BookOpen className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900">{documento.codigo}</span>
        <span className="block truncate text-xs text-slate-500">{documento.titulo}</span>
      </span>
      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand-600" />
    </Link>
  );
}
