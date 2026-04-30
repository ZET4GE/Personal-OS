export const TECH_CATEGORIES = ['language', 'framework', 'tool', 'platform', 'vendor', 'other'] as const
export type TechCategory = (typeof TECH_CATEGORIES)[number]

export const TECH_CATEGORY_LABELS: Record<TechCategory, string> = {
  language:  'Lenguajes',
  framework: 'Frameworks & Librerías',
  tool:      'Herramientas',
  platform:  'Plataformas & Cloud',
  vendor:    'Networking & Vendors',
  other:     'Otros',
}

// ─── Icon descriptor ─────────────────────────────────────────
export type TechIconDescriptor =
  | { type: 'devicon';     slug: string; variant: 'original' | 'plain' | 'line' }
  | { type: 'simpleicons'; slug: string }
  | { type: 'none' }

// ─── Catalog item (predefined techs) ─────────────────────────
export interface TechCatalogItem {
  name:     string
  slug:     string         // internal key & DB value
  category: TechCategory
  icon:     TechIconDescriptor
}

// ─── DB entity ───────────────────────────────────────────────
export interface UserTechStack {
  id:            string
  user_id:       string
  tech_name:     string
  tech_slug:     string
  category:      TechCategory
  display_order: number
  created_at:    string
  updated_at:    string
}

// ─── Action results ──────────────────────────────────────────
export type TechStackActionResult =
  | { ok: true; error?: never }
  | { error: string; ok?: never }
