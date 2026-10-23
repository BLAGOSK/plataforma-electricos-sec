import { BookMarked, BookOpen, FileText, Gavel, Map as MapIcon, type LucideIcon } from 'lucide-react';
import type { CategoriaNormativa, CategoriaVideo } from '@/types/aprendizaje';

export const categoriasNormativa: Array<{ value: CategoriaNormativa; label: string; icon: LucideIcon }> = [
  { value: 'pliego_ric', label: 'Pliegos técnicos RIC', icon: BookOpen },
  { value: 'reglamento', label: 'Reglamentos', icon: Gavel },
  { value: 'norma', label: 'Normas', icon: BookMarked },
  { value: 'instructivo', label: 'Instructivos', icon: FileText },
  { value: 'guia', label: 'Guías', icon: MapIcon },
];

export const infoCategoriaNormativa = Object.fromEntries(categoriasNormativa.map((c) => [c.value, c])) as Record<
  CategoriaNormativa,
  (typeof categoriasNormativa)[number]
>;

export const categoriasVideo: Array<{ value: CategoriaVideo; label: string }> = [
  { value: 'tutorial', label: 'Tutoriales' },
  { value: 'normativa', label: 'Normativa' },
  { value: 'webinar', label: 'Webinars' },
  { value: 'caso_practico', label: 'Casos prácticos' },
];

export const etiquetaCategoriaVideo = Object.fromEntries(categoriasVideo.map((c) => [c.value, c.label])) as Record<CategoriaVideo, string>;

/** 1475 → "24:35"; 3620 → "1:00:20" */
export function formatDuracion(seg: number): string {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = Math.floor(seg % 60);
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return `${h ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}
