import { siteConfig } from './site';

export interface NavLink {
  label: string;
  href: string;
  /** Shown in the mega/mobile menu under the label. Keep under ~60 characters. */
  description?: string;
  children?: NavLink[];
}

/** Primary navigation. Five items maximum — past that, people stop reading. */
export const mainNav: NavLink[] = [
  {
    label: 'Projects',
    href: '/projects',
    description: 'Finished buildings, with the numbers behind them.',
  },
  {
    label: 'Services',
    href: '/services',
    description: 'Design, build, interiors and everything in between.',
  },
  {
    label: 'About',
    href: '/about',
    description: 'Who we are and how we run a site.',
    children: [
      { label: 'The studio', href: '/about', description: 'How DICKALO works.' },
      { label: 'Team', href: '/about/team', description: 'The people on your project.' },
    ],
  },
  {
    label: 'Contact',
    href: '/contact',
    description: `Tell us about your site. We reply ${siteConfig.contact.responseTime}.`,
  },
];

/** Footer columns. Grouped by what someone is trying to do, not by page type. */
export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: 'Work',
    links: [
      { label: 'All projects', href: '/projects' },
      { label: 'Virtual tour', href: '/tour/duplex' },
      { label: 'Residential', href: '/projects?category=residential' },
      { label: 'Commercial', href: '/projects?category=commercial' },
      { label: 'Interiors', href: '/projects?category=interior' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Architectural design', href: '/services#architectural-design' },
      { label: 'Construction', href: '/services#construction' },
      { label: 'Interior architecture', href: '/services#interior-architecture' },
      { label: 'Project management', href: '/services#project-management' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { label: 'About us', href: '/about' },
      { label: 'Our team', href: '/about/team' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: `mailto:${siteConfig.contact.careersEmail}` },
    ],
  },
];

/** Small print. Kept separate so it never competes with the real navigation. */
export const legalNav: NavLink[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

/**
 * Homepage section anchors used by the scroll-spy and the hero's
 * scroll-to-next-section control.
 */
export const homeSections = {
  hero: 'hero',
  featured: 'featured-projects',
  services: 'services',
  process: 'process',
  stats: 'stats',
  testimonials: 'testimonials',
  cta: 'start-a-project',
} as const;
