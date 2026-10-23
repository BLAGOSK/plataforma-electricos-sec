import { Cable, Lightbulb, TrendingDown, Zap, type LucideIcon } from 'lucide-react';
import type { ExtensionSlug } from '@/types/extension';

export const iconosExtension: Record<ExtensionSlug, LucideIcon> = {
  conductores: Cable,
  'caida-tension': TrendingDown,
  cortocircuito: Zap,
  alumbrado: Lightbulb,
};
