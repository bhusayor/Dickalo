/**
 * Single source of truth for company facts, contact details and page-level copy.
 *
 * Copy lives here rather than inside components so that a non-developer can
 * change a headline without touching JSX, and so the same sentence is never
 * written twice in two slightly different ways.
 */

const DEFAULT_SITE_URL = 'https://dickalo.com';

/**
 * Metadata is evaluated while Next.js collects every route. Normalize the
 * dashboard value here so an empty or malformed URL cannot stop that build.
 */
function resolveSiteUrl(value: string | undefined): string {
  const candidate = value?.trim();
  if (!candidate) return DEFAULT_SITE_URL;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return DEFAULT_SITE_URL;
    url.hash = '';
    url.search = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const siteUrl = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const siteConfig = {
  name: 'DICKALO',
  legalName: 'DICKALO Architecture & Construction Ltd.',
  /** Used after the page title, e.g. "Projects — DICKALO". */
  tagline: 'Architecture & Construction',
  /** The one line that has to do the most work: search results, OG cards, footer. */
  description:
    'DICKALO is an architecture and construction firm based in Ilorin and available for projects nationwide. We design buildings, build them and stay accountable through handover.',
  shortDescription: 'Architecture and construction firm working across Nigeria.',
  url: siteUrl,
  locale: 'en_NG',
  language: 'en-NG',
  founded: '2011',
  ogImage: '/images/og-default.jpg',

  contact: {
    email: 'studio@dickalo.com',
    careersEmail: 'careers@dickalo.com',
    phone: '+234 801 234 5678',
    /** E.164 for tel: links and WhatsApp deep links. */
    phoneRaw: '+2348012345678',
    whatsapp: 'https://wa.me/2348012345678',
    /** How fast we actually reply. Only promise what the studio can keep. */
    responseTime: 'within two working days',
  },

  /**
   * The studio is based in Ilorin. A full street address has not been published,
   * so public-facing surfaces use the city and state without inventing one.
   */
  address: {
    city: 'Ilorin',
    state: 'Kwara State',
    country: 'Nigeria',
    countryCode: 'NG',
    latitude: 8.4966,
    longitude: 4.5421,
    mapsUrl: 'https://maps.google.com/?q=Ilorin+Kwara+State+Nigeria',
  },

  /** Where the permanent studio is based. Project teams travel nationwide. */
  offices: [{ city: 'Ilorin', label: 'Studio', detail: 'Kwara State', primary: true }],

  hours: {
    label: 'Monday to Friday, 8:30am – 6:00pm WAT',
    /** schema.org openingHours format. */
    spec: [
      {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:30',
        closes: '18:00',
      },
    ],
  },

  socials: [
    { name: 'Instagram', label: 'Instagram', href: 'https://instagram.com/dickalo' },
    { name: 'LinkedIn', label: 'LinkedIn', href: 'https://linkedin.com/company/dickalo' },
    { name: 'Behance', label: 'Behance', href: 'https://behance.net/dickalo' },
    { name: 'YouTube', label: 'YouTube', href: 'https://youtube.com/@dickalo' },
  ],

  /**
   * States we have actually built in. Used in the footer and in JSON-LD.
   * Listing somewhere we have never worked is the kind of claim a client checks.
   */
  serviceAreas: [
    'Kwara',
    'Lagos',
    'Abuja (FCT)',
    'Rivers',
    'Enugu',
    'Kano',
    'Oyo',
    'Delta',
    'Akwa Ibom',
  ],

  /** Shown wherever we need to say "national" without listing eight states. */
  coverage: 'Based in Ilorin and available for work nationwide',
} as const;

/**
 * Hero copy. Kept as separate lines so the break is a design decision rather
 * than an accident of viewport width.
 */
export const heroCopy = {
  eyebrow: 'Architecture & construction — Nigeria',
  /**
   * Two lines, one size, one colour.
   *
   * National language makes the Ilorin base clear without implying that it
   * limits where the studio can accept work.
   */
  headline: ['We design buildings', 'across Nigeria, then', 'we build them.'],
  headlineFlat: 'We design buildings across Nigeria, then we build them.',
  subhead:
    'Based in Ilorin and available nationwide. One team carries the work from the first drawing to the final handover, wherever your site is in Nigeria.',
  primaryCta: { label: 'Start a project', href: '/contact' },
  secondaryCta: { label: 'See our work', href: '/projects' },
  scrollHint: 'Scroll',
  /** Sits under the video. Says what you are actually looking at. */
  mediaCaption: 'On site in Ikoyi, Lagos — a five-bedroom house, month nine of sixteen.',
  /** Proof, in the corner. Facts rather than adjectives. */
  markers: [
    { value: '120+', label: 'Projects delivered' },
    { value: 'Nigeria', label: 'Available nationwide' },
    { value: '96%', label: 'On the contract date' },
  ],
  /** The floating card. A real link to a real project. */
  featured: {
    label: 'Now on site',
    title: 'Banana Island Residence',
    location: 'Ikoyi, Lagos',
    href: '/projects/banana-island-residence',
    cta: 'View project',
  },
} as const;

/** Reused across the homepage, the about page and the footer. */
export const brandStatements = {
  /** Shown under the stats band. */
  positioning:
    'Most projects in Nigeria fail on the handover date, not the drawing. We took the drawing and the build under one roof so there is nobody left to blame.',
  /** About page opener. */
  aboutIntro:
    'DICKALO is based in Ilorin and works nationwide. Design, technical coordination and site delivery stay connected, so the person who resolves a detail can follow it through on projects across Nigeria.',
  /** Footer sign-off. */
  footerNote: 'Drawn, built and handed over across Nigeria.',
} as const;

export type SiteConfig = typeof siteConfig;
