import { Calculator, Camera, FileBadge, FileQuestion, Map as MapIcon, Table2, type LucideIcon } from 'lucide-react';
import type { CategoriaDocumento } from '@/types/documento';

export const categoriasDocumento: Array<{ value: CategoriaDocumento; label: string; icon: LucideIcon }> = [
  { value: 'planos', label: 'Planos', icon: MapIcon },
  { value: 'memoria_calculo', label: 'Memoria de cálculo', icon: Calculator },
  { value: 'fotografias', label: 'Fotografías', icon: Camera },
  { value: 'cuadros_carga', label: 'Tablas / cuadros de carga', icon: Table2 },
  { value: 'certificados', label: 'Certificados', icon: FileBadge },
  { value: 'otros', label: 'Otros', icon: FileQuestion },
];

export const infoCategoria = Object.fromEntries(categoriasDocumento.map((c) => [c.value, c])) as Record<
  CategoriaDocumento,
  (typeof categoriasDocumento)[number]
>;

export const ACCEPT_DOCUMENTOS = 'application/pdf,image/*,.dwg,.dxf,.xlsx,.xls,.docx,.doc';
export const FORMATOS_DOCUMENTOS = 'PDF, imágenes, DWG/DXF, Excel o Word';
