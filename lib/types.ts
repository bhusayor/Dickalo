/**
 * Shared domain types.
 *
 * Sanity documents are typed at the shape we actually query (see
 * `lib/sanity/queries.ts`), not at the raw document shape, so a projection
 * change and a type change happen in the same place.
 */

// ---------------------------------------------------------------------------
// Sanity primitives
// ---------------------------------------------------------------------------

export interface SanityImageAsset {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  /** Present when the editor has set a hotspot in the Studio. */
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  alt?: string;
  /** Low-quality blur placeholder generated at query time. */
  lqip?: string;
  dimensions?: { width: number; height: number; aspectRatio: number };
}

export interface SanitySlug {
  _type: 'slug';
  current: string;
}

/** Minimal Portable Text block. Rendered with @portabletext/react. */
export interface PortableTextBlock {
  _key: string;
  _type: string;
  children?: { _key: string; _type: string; text: string; marks?: string[] }[];
  markDefs?: { _key: string; _type: string; href?: string }[];
  style?: string;
  listItem?: string;
  level?: number;
}

// ---------------------------------------------------------------------------
// Content models
// ---------------------------------------------------------------------------

export type ProjectCategory =
  | 'residential'
  | 'commercial'
  | 'hospitality'
  | 'interior'
  | 'mixed-use'
  | 'institutional';

export type ProjectStatus = 'completed' | 'in-progress' | 'concept';

export interface ProjectFact {
  label: string;
  value: string;
}

export interface Project {
  _id: string;
  _createdAt?: string;
  title: string;
  slug: string;
  /** One line under the title on cards. Written as a claim, not a category. */
  tagline?: string;
  category: ProjectCategory;
  status: ProjectStatus;
  location: string;
  /** Display year, e.g. "2024". Stored as a string so "2022–2024" is valid. */
  year: string;
  client?: string;
  /** Gross floor area with unit already applied, e.g. "4,200 m²". */
  area?: string;
  /** Free-form so "12 months" and "18 months (phased)" both work. */
  duration?: string;
  services?: string[];
  excerpt: string;
  body?: PortableTextBlock[];
  coverImage: SanityImageAsset;
  /**
   * Local image path, used only by the fallback projects in `lib/constants.ts`
   * when Sanity is unconfigured. `Image` resolves `source` first and falls
   * through to this, so real CMS content always wins.
   */
  coverImageUrl?: string;
  gallery?: SanityImageAsset[];
  /** Key/value stats rendered in the project detail sidebar. */
  facts?: ProjectFact[];
  featured: boolean;
  /** Manual sort key. Lower shows first. */
  order?: number;
  seo?: SeoFields;
}

export interface Service {
  _id: string;
  title: string;
  slug: string;
  /** The promise, in one sentence. Shown on the card. */
  summary: string;
  description?: PortableTextBlock[];
  /** Icon key resolved by `components/sections/Services.tsx`. */
  icon: ServiceIconKey;
  /** Concrete deliverables. Three to five reads best. */
  deliverables?: string[];
  image?: SanityImageAsset;
  order?: number;
}

export type ServiceIconKey =
  | 'draft'
  | 'build'
  | 'interior'
  | 'manage'
  | 'restore'
  | 'consult';

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  /** Two sentences maximum. Says what they do, not how passionate they are. */
  bio?: string;
  image?: SanityImageAsset;
  credentials?: string[];
  linkedin?: string;
  email?: string;
  order?: number;
}

export interface Testimonial {
  _id: string;
  quote: string;
  author: string;
  role: string;
  company?: string;
  image?: SanityImageAsset;
  /** Optional link to the project the quote is about. */
  project?: { title: string; slug: string };
  rating?: number;
  featured?: boolean;
}

export interface SeoFields {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: SanityImageAsset;
  noIndex?: boolean;
}

export interface SiteSettings {
  _id: string;
  title: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  socials?: { platform: string; url: string }[];
  stats?: { label: string; value: number; suffix?: string }[];
  ogImage?: SanityImageAsset;
}

// ---------------------------------------------------------------------------
// Forms and API
// ---------------------------------------------------------------------------

export type ProjectType =
  | 'residential'
  | 'commercial'
  | 'interior'
  | 'renovation'
  | 'consultancy'
  | 'other';

export type BudgetBand =
  | 'under-25m'
  | '25m-100m'
  | '100m-500m'
  | 'over-500m'
  | 'not-sure';

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType: ProjectType;
  budget?: BudgetBand;
  location?: string;
  message: string;
  /** Honeypot. Must be empty; bots fill it. */
  website?: string;
  consent: boolean;
}

export interface SubscribePayload {
  email: string;
  name?: string;
  source?: string;
  website?: string;
}

/** Discriminated union so callers must handle both branches. */
export type ApiResponse<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code: ApiErrorCode; fieldErrors?: Record<string, string> };

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'NOT_FOUND'
  | 'DUPLICATE'
  | 'SERVICE_UNAVAILABLE'
  | 'UNAUTHORIZED'
  | 'INTERNAL_ERROR';

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------

export interface ProcessStep {
  id: string;
  number: string;
  title: string;
  description: string;
  /** What the client physically receives at the end of this stage. */
  deliverable: string;
}

export interface StatItem {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  /** Optional clarifier shown small, under the label. */
  note?: string;
}

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
