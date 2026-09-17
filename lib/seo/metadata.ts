import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { absoluteUrl, truncate } from '@/lib/utils';

/**
 * Metadata helpers.
 *
 * Titles are written for a search result, not for a browser tab: they answer
 * "is this the page I want?" in under 60 characters. Descriptions say something
 * specific rather than repeating the title.
 */

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 158;

export interface PageMetaOptions {
  title: string;
  description: string;
  /** Path only, e.g. "/projects". Turned into a canonical URL. */
  path?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  noIndex?: boolean;
  keywords?: string[];
}

/** Default keyword set. Deliberately short — keyword stuffing is a ranking risk. */
export const BASE_KEYWORDS = [
  // National head terms first — these are what the firm actually competes on.
  'architecture firm Nigeria',
  'construction company Nigeria',
  'design and build Nigeria',
  'architects in Nigeria',
  'building contractors Nigeria',
  // City-level long tail. Kept because search intent is usually local even
  // when the firm is not, but no longer the primary framing.
  'architecture firm Lagos',
  'architects Abuja',
  'construction company Port Harcourt',
  'residential architects Nigeria',
  'commercial construction Nigeria',
  'interior architecture Nigeria',
  'architects in Ilorin',
  'construction company Ilorin',
];

export function buildMetadata(options: PageMetaOptions): Metadata {
  const {
    title,
    description,
    path = '/',
    image = siteConfig.ogImage,
    imageAlt,
    type = 'website',
    publishedTime,
    noIndex = false,
    keywords = [],
  } = options;

  const canonical = absoluteUrl(path);
  const ogImage = image.startsWith('http') ? image : absoluteUrl(image);
  const safeDescription = truncate(description, DESCRIPTION_MAX);

  return {
    title,
    description: safeDescription,
    keywords: [...BASE_KEYWORDS, ...keywords],
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    openGraph: {
      type,
      url: canonical,
      title: truncate(title, TITLE_MAX),
      description: safeDescription,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: imageAlt ?? title,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: truncate(title, TITLE_MAX),
      description: safeDescription,
      images: [ogImage],
    },
  };
}

/**
 * Page-level metadata, written once here so the wording is reviewed together
 * rather than scattered across route files.
 */
export const pageMeta = {
  home: {
    title: 'DICKALO — Architecture & Construction in Nigeria',
    description:
      'We design buildings and we build them. 120 projects delivered across eight states, and a handover date we keep.',
    path: '/',
  },
  projects: {
    title: 'Projects — Architecture & Construction Portfolio',
    description:
      'Houses, offices, hotels and public buildings completed across Nigeria, with the areas, timelines and budgets behind them.',
    path: '/projects',
    keywords: ['architecture portfolio Nigeria', 'construction projects Nigeria'],
  },
  services: {
    title: 'Services — Design, Build and Everything Between',
    description:
      'Architectural design, construction, interiors, project management, restoration and feasibility. What each one delivers, in plain terms.',
    path: '/services',
    keywords: ['design and build Nigeria', 'architectural services Nigeria'],
  },
  about: {
    title: 'DICKALO Studio — Architecture & Construction, Ilorin',
    description:
      'Meet the DICKALO studio and team. Based in Ilorin, available nationwide and experienced in architecture and construction projects across Nigeria.',
    path: '/about',
  },
  team: {
    title: 'Our Team — DICKALO Studio, Ilorin',
    description:
      'The architects, engineers and site managers who will be on your project. Names, roles and what each of them is accountable for.',
    path: '/about#team',
  },
  contact: {
    title: 'Contact DICKALO — Start a Project',
    description:
      'Tell us about your site, your budget and your timeline. We reply within two working days, and we say honestly if we are the wrong team.',
    path: '/contact',
    keywords: ['hire architect Nigeria', 'construction quote Nigeria'],
  },
  thankYou: {
    title: 'Enquiry Received — DICKALO',
    description: 'Your enquiry reached the studio. Here is what happens next.',
    path: '/contact/thank-you',
    noIndex: true,
  },
  privacy: {
    title: 'Privacy Policy',
    description:
      'How DICKALO collects, uses and protects information submitted through this website.',
    path: '/privacy',
  },
  terms: {
    title: 'Website Terms',
    description:
      'The terms that apply when browsing the DICKALO website or sending the studio an enquiry.',
    path: '/terms',
  },
} as const satisfies Record<string, PageMetaOptions>;

/** Title for a single project page, kept under the search-result cut-off. */
export function projectTitle(name: string, location?: string): string {
  const base = location ? `${name}, ${location}` : name;
  return truncate(`${base} — DICKALO`, TITLE_MAX);
}
