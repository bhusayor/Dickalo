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
    'DICKALO is a Nigerian architecture and construction firm. We design buildings, we build them, and we hand over on the date we promised — in Lagos, Abuja, Port Harcourt and beyond.',
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
   * Head office. DICKALO works nationally, so this is where the post goes and
   * where the drawings are done — not the limit of where we build. The regional
   * offices below matter more to someone deciding whether we can reach them.
   */
  address: {
    street: '14 Ligali Ayorinde Street',
    district: 'Victoria Island',
    city: 'Lagos',
    state: 'Lagos State',
    postalCode: '106104',
    country: 'Nigeria',
    countryCode: 'NG',
    latitude: 6.4281,
    longitude: 3.4219,
    mapsUrl: 'https://maps.google.com/?q=Ligali+Ayorinde+Street+Victoria+Island+Lagos',
  },

  /** Where we keep people permanently, as opposed to where we can work. */
  offices: [
    { city: 'Lagos', label: 'Head office', detail: 'Victoria Island', primary: true },
    { city: 'Abuja', label: 'Regional office', detail: 'Wuse II', primary: false },
    { city: 'Port Harcourt', label: 'Regional office', detail: 'Old GRA', primary: false },
  ],

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
  serviceAreas: ['Lagos', 'Abuja (FCT)', 'Rivers', 'Enugu', 'Kano', 'Oyo', 'Delta', 'Akwa Ibom'],

  /** Shown wherever we need to say "national" without listing eight states. */
  coverage: 'Lagos, Abuja, Port Harcourt and across Nigeria',
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
   * "in Nigeria" rather than "in Lagos": the firm builds nationally, and a
   * client in Abuja or Port Harcourt reading a Lagos-only headline assumes,
   * correctly, that they are not being spoken to.
   */
  headline: ['We design buildings', 'across Nigeria, then', 'we build them.'],
  headlineFlat: 'We design buildings across Nigeria, then we build them.',
  subhead:
    'One team, one contract, and the person who signed it is the person who answers your call — in Lagos, Abuja, Port Harcourt or wherever your site is.',
  primaryCta: { label: 'Start a project', href: '/contact' },
  secondaryCta: { label: 'See our work', href: '/projects' },
  scrollHint: 'Scroll',
  /** Sits under the video. Says what you are actually looking at. */
  mediaCaption: 'On site in Ikoyi, Lagos — a five-bedroom house, month nine of sixteen.',
  /** Proof, in the corner. Facts rather than adjectives. */
  markers: [
    { value: '120+', label: 'Projects delivered' },
    { value: '8', label: 'States built in' },
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
    'DICKALO started in 2011 with one contract and three people. We now run design and construction out of three offices — Lagos, Abuja and Port Harcourt — which means the person who drew your ceiling detail can be on your site the week it goes in, wherever that site is.',
  /** Footer sign-off. */
  footerNote: 'Drawn, built and handed over across Nigeria.',
} as const;

export type SiteConfig = typeof siteConfig;
