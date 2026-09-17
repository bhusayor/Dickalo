import type {
  BudgetBand,
  ProcessStep,
  PortableTextBlock,
  Project,
  ProjectCategory,
  ProjectType,
  Service,
  StatItem,
  Testimonial,
} from './types';

/**
 * Static content and fallbacks.
 *
 * Everything here is rendered when Sanity is unreachable or empty — a fresh
 * clone with no CMS credentials still produces a complete, honest-looking site
 * rather than a page of empty grids. Once Sanity has documents, the CMS wins.
 */

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  hospitality: 'Hospitality',
  interior: 'Interior',
  'mixed-use': 'Mixed use',
  institutional: 'Institutional',
};

export const STATUS_LABELS = {
  completed: 'Completed',
  'in-progress': 'On site',
  concept: 'Concept',
} as const;

export const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: 'residential', label: 'A home' },
  { value: 'commercial', label: 'A commercial building' },
  { value: 'interior', label: 'An interior fit-out' },
  { value: 'renovation', label: 'A renovation or restoration' },
  { value: 'consultancy', label: 'Advice before I commit' },
  { value: 'other', label: 'Something else' },
];

/**
 * Budget bands in Nigerian Naira. Wide bands on purpose: we only need to know
 * which conversation to have, and narrow bands make people abandon the form.
 */
export const BUDGET_OPTIONS: { value: BudgetBand; label: string }[] = [
  { value: 'under-25m', label: 'Under ₦25 million' },
  { value: '25m-100m', label: '₦25 – 100 million' },
  { value: '100m-500m', label: '₦100 – 500 million' },
  { value: 'over-500m', label: 'Over ₦500 million' },
  { value: 'not-sure', label: 'Not sure yet' },
];

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export const SERVICES: Service[] = [
  {
    _id: 'svc-architectural-design',
    title: 'Architectural design',
    slug: 'architectural-design',
    icon: 'draft',
    summary:
      'Drawings you can actually build from. Every line is checked against cost, climate and the building code of the state you are building in.',
    deliverables: [
      'Concept and massing',
      'Full working drawings',
      'Approval-ready submissions',
      'Material schedules',
    ],
    order: 1,
  },
  {
    _id: 'svc-construction',
    title: 'Construction',
    slug: 'construction',
    icon: 'build',
    summary:
      'One contract, one accountable team. We self-perform the structural work so the schedule stays in our hands, not a subcontractor’s.',
    deliverables: [
      'Site setup and earthworks',
      'Structural frame',
      'Envelope and finishes',
      'Weekly cost and progress reports',
    ],
    order: 2,
  },
  {
    _id: 'svc-interior-architecture',
    title: 'Interior architecture',
    slug: 'interior-architecture',
    icon: 'interior',
    summary:
      'The finish is the part people touch every day. We detail it to the millimetre and confirm every material has cleared customs before we start.',
    deliverables: [
      'Spatial planning',
      'Joinery and lighting design',
      'FF&E sourcing',
      'Styled handover',
    ],
    order: 3,
  },
  {
    _id: 'svc-project-management',
    title: 'Project management',
    slug: 'project-management',
    icon: 'manage',
    summary:
      'One point of contact, a live budget and a weekly report short enough that you will actually read it.',
    deliverables: [
      'Programme and critical path',
      'Cost control and valuations',
      'Consultant coordination',
      'Risk register',
    ],
    order: 4,
  },
  {
    _id: 'svc-renovation',
    title: 'Renovation & restoration',
    slug: 'renovation-restoration',
    icon: 'restore',
    summary:
      'Old buildings hide things. We survey first, price second, and tell you what we found either way — including when it changes the number.',
    deliverables: [
      'Condition survey',
      'Structural remediation',
      'Services replacement',
      'Sympathetic reinstatement',
    ],
    order: 5,
  },
  {
    _id: 'svc-consultancy',
    title: 'Feasibility & consultancy',
    slug: 'feasibility-consultancy',
    icon: 'consult',
    summary:
      'Before you buy the land, know what it can hold. Site studies, massing options and a cost range you can take to a lender.',
    deliverables: [
      'Site and title review',
      'Planning constraints',
      'Massing options',
      'Order-of-cost estimate',
    ],
    order: 6,
  },
];

// ---------------------------------------------------------------------------
// Process
// ---------------------------------------------------------------------------

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'discovery',
    number: '01',
    title: 'We walk the site',
    description:
      'Before anything is drawn we visit, measure and ask the awkward questions about budget, timeline and who signs off. Most surprises later are questions nobody asked here.',
    deliverable: 'A written brief you approve',
  },
  {
    id: 'concept',
    number: '02',
    title: 'Concept and feasibility',
    description:
      'You see massing, materials and a cost range side by side. If the numbers do not work, you find out at this stage — on paper, not on site.',
    deliverable: 'Concept pack and cost range',
  },
  {
    id: 'design',
    number: '03',
    title: 'Design development',
    description:
      'Architecture, structure and services get coordinated into one set of drawings. Approvals go in. Long-lead materials get ordered while the paperwork moves.',
    deliverable: 'Working drawings and approvals',
  },
  {
    id: 'build',
    number: '04',
    title: 'Build',
    description:
      'We break ground. Every Friday you get photos, spend to date and what moved that week. When something slips, you hear it from us first.',
    deliverable: 'Weekly progress and cost report',
  },
  {
    id: 'handover',
    number: '05',
    title: 'Handover',
    description:
      'Snags closed before you move in, not after. Manuals, warranties and as-built drawings handed over in one folder. We come back at six months to check the building settled well.',
    deliverable: 'Keys, warranties and a six-month check',
  },
];

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export const STATS: StatItem[] = [
  { value: 120, suffix: '+', label: 'Projects delivered', note: 'Across eight states' },
  { value: 14, label: 'Years building in Nigeria', note: 'Since 2011' },
  {
    value: 96,
    suffix: '%',
    label: 'Handed over on schedule',
    note: 'Measured against signed contract dates',
  },
  { value: 42, label: 'People on the team', note: 'Ilorin studio and project sites' },
];

// ---------------------------------------------------------------------------
// Fallback testimonials
// ---------------------------------------------------------------------------

export const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    _id: 't-1',
    quote:
      'They gave us a date in the contract and we moved in on that date. After two previous builds in this country, I did not think that was possible.',
    author: 'Adaeze Okonkwo',
    role: 'Homeowner',
    company: 'Banana Island Residence, Lagos',
    featured: true,
  },
  {
    _id: 't-2',
    quote:
      'The weekly report was one page and it was always honest. When a shipment was stuck at Apapa, we knew that Friday, not three weeks later.',
    author: 'Tunde Balogun',
    role: 'Managing Director',
    company: 'Meridian Holdings, Abuja',
    featured: true,
  },
  {
    _id: 't-3',
    quote:
      'We asked for a hotel that felt like Port Harcourt and not like a catalogue. They pushed back on half our ideas and they were right about most of them.',
    author: 'Ifeoma Nwachukwu',
    role: 'Group Operations Director',
    company: 'Harbourline Hospitality, Port Harcourt',
    featured: true,
  },
  {
    _id: 't-4',
    quote:
      'Our site is eight hundred kilometres from their head office and it never once felt like it. The site manager lived in Kano for the whole build.',
    author: 'Musa Abdullahi',
    role: 'Project Sponsor',
    company: 'Nassarawa Civic Trust, Kano',
    featured: true,
  },
  {
    _id: 't-5',
    quote:
      'They told us our budget could not buy the brief we had written. Nobody else had said that. It saved us about a year of finding out slowly.',
    author: 'Chinelo Obi',
    role: 'Founder',
    company: 'Ogui Innovation Hub, Enugu',
    featured: true,
  },
];

// ---------------------------------------------------------------------------
// Fallback projects (shown before Sanity has content)
// ---------------------------------------------------------------------------

/**
 * Empty Sanity asset. The fallback projects have no CMS document, so this
 * satisfies the type while `coverImageUrl` supplies the actual picture.
 */
const placeholderImage = {
  _type: 'image' as const,
  asset: { _ref: '', _type: 'reference' as const },
};

function projectStory(id: string, heading: string, paragraphs: string[]): PortableTextBlock[] {
  return [heading, ...paragraphs].map((text, index) => ({
    _key: `${id}-${index}`,
    _type: 'block',
    style: index === 0 ? 'h2' : 'normal',
    markDefs: [],
    children: [
      {
        _key: `${id}-${index}-span`,
        _type: 'span',
        text,
        marks: [],
      },
    ],
  }));
}

export const FALLBACK_PROJECTS: Project[] = [
  {
    _id: 'p-1',
    title: 'Banana Island Residence',
    slug: 'banana-island-residence',
    tagline: 'A family house designed around the harmattan, not against it',
    category: 'residential',
    status: 'completed',
    location: 'Ikoyi, Lagos',
    year: '2024',
    area: '1,150 m²',
    duration: '16 months',
    excerpt:
      'Five bedrooms arranged around a shaded courtyard so the house cools itself. Cross-ventilation does the work the generator used to.',
    body: projectStory('banana-story', 'The courtyard became the plan', [
      'The family wanted privacy from the street without living behind closed curtains. We placed the social rooms around a planted courtyard, then opened each one on two sides so air can move through the house even on still afternoons.',
      'Deep verandas keep the glass in shade. Pale stone, warm timber and a restrained structure let the changing light and garden carry the rooms from morning to evening.',
    ]),
    coverImage: placeholderImage,
    coverImageUrl: '/images/projects/banana-island-residence.jpg',
    galleryImageUrls: [
      {
        src: '/images/projects/gallery/banana-island-courtyard.webp',
        alt: 'Shaded courtyard of the Banana Island Residence with a mature tree and tropical planting',
        caption: 'The central courtyard brings shade, air and greenery into the heart of the home.',
      },
      {
        src: '/images/projects/gallery/banana-island-living.webp',
        alt: 'Double-height living room opening onto the courtyard at Banana Island Residence',
        caption: 'Living spaces open on two sides to make cross-ventilation part of daily life.',
      },
    ],
    featured: true,
    order: 1,
  },
  {
    _id: 'p-2',
    title: 'Meridian Tower',
    slug: 'meridian-tower',
    tagline: 'Twelve floors of office space that opens the windows',
    category: 'commercial',
    status: 'completed',
    location: 'Central Business District, Abuja',
    year: '2023',
    area: '18,400 m²',
    duration: '31 months',
    excerpt:
      'A commercial tower with an operable façade and a core placed to keep every desk within eight metres of daylight.',
    body: projectStory('meridian-story', 'Daylight set the floor plate', [
      'We started with the working day rather than the skyline. Moving the core to the west shortened every route to a window and created office floors that can divide without leaving dark space behind.',
      'The external fins cut the hardest sun while operable panels let each floor use Abuja’s cooler mornings. The result is a tall building that feels open at the scale of a single desk.',
    ]),
    coverImage: placeholderImage,
    coverImageUrl: '/images/projects/meridian-tower.jpg',
    galleryImageUrls: [
      {
        src: '/images/projects/gallery/meridian-tower-exterior.webp',
        alt: 'Meridian Tower in Abuja with a shaded blue-glass climate facade',
        caption:
          'Deep fins and opening panels turn the facade into part of the environmental system.',
      },
      {
        src: '/images/projects/gallery/meridian-tower-office.webp',
        alt: 'Daylit office floor inside Meridian Tower with timber finishes and city views',
        caption: 'The compact plan keeps every workstation close to daylight and a view.',
      },
    ],
    featured: true,
    order: 2,
  },
  {
    _id: 'p-3',
    title: 'Harbourline Hotel',
    slug: 'harbourline-hotel',
    tagline: 'Eighty-six rooms that could not be anywhere else',
    category: 'hospitality',
    status: 'completed',
    location: 'Old GRA, Port Harcourt',
    year: '2023',
    area: '9,700 m²',
    duration: '24 months',
    excerpt:
      'Terracotta screens, local hardwood and a lobby built around a single mature tree that was on site before we were.',
    body: projectStory('harbourline-story', 'The tree decided where arrival begins', [
      'A mature tree stood on the only sensible place for the lobby. Instead of removing it, we divided the arrival sequence around it and made the canopy the first ceiling guests experience.',
      'Terracotta screens soften the rain and sun, while dark local hardwood continues from the public rooms into the guest suites. The hotel belongs to Port Harcourt before it belongs to a brand.',
    ]),
    coverImage: placeholderImage,
    coverImageUrl: '/images/projects/harbourline-hotel.jpg',
    galleryImageUrls: [
      {
        src: '/images/projects/gallery/harbourline-lobby-courtyard.webp',
        alt: 'Harbourline Hotel lobby arranged around a mature tropical tree',
        caption: 'The retained tree anchors a sheltered arrival court at the centre of the lobby.',
      },
      {
        src: '/images/projects/gallery/harbourline-guest-room.webp',
        alt: 'Harbourline Hotel guest room with hardwood screens and Nigerian textiles',
        caption:
          'Local timber, terracotta and woven details give the rooms a distinct sense of place.',
      },
    ],
    featured: true,
    order: 3,
  },
  {
    _id: 'p-4',
    title: 'Ogui Innovation Hub',
    slug: 'ogui-innovation-hub',
    tagline: 'A warehouse given forty more years',
    category: 'mixed-use',
    status: 'in-progress',
    location: 'Ogui, Enugu',
    year: '2025',
    area: '6,300 m²',
    duration: '18 months',
    excerpt:
      'A 1970s warehouse stripped to its frame and rebuilt as workspace. We kept the roof trusses and the graffiti on the east wall.',
    body: projectStory('ogui-story', 'Repair revealed the character', [
      'The warehouse had the height and toughness the new programme needed. Its damage was selective, so we repaired the frame, cleaned the original trusses and treated the marks on the east wall as part of the building’s memory.',
      'A lightweight insertion now holds meeting rooms, workshops and services without hiding the old shell. Wide curtains and movable furniture let one floor change from focused work to a public event in minutes.',
    ]),
    coverImage: placeholderImage,
    coverImageUrl: '/images/projects/ogui-innovation-hub.jpg',
    galleryImageUrls: [
      {
        src: '/images/projects/gallery/ogui-hub-exterior.webp',
        alt: 'Restored warehouse exterior of Ogui Innovation Hub after rain in Enugu',
        caption: 'New glass and metal elements sit lightly inside the repaired warehouse shell.',
      },
      {
        src: '/images/projects/gallery/ogui-hub-workspace.webp',
        alt: 'Flexible shared workspace beneath retained steel trusses at Ogui Innovation Hub',
        caption:
          'The original trusses and east-wall graffiti remain visible throughout the shared workspace.',
      },
    ],
    featured: true,
    order: 4,
  },
  {
    _id: 'p-5',
    title: 'Nassarawa Civic Library',
    slug: 'nassarawa-civic-library',
    tagline: 'A public building that stays cool without air conditioning',
    category: 'institutional',
    status: 'completed',
    location: 'Nassarawa, Kano',
    year: '2022',
    area: '3,200 m²',
    duration: '20 months',
    excerpt:
      'Deep overhangs, a thermal chimney and rammed-earth walls. In Kano heat the reading room sits eleven degrees below the street.',
    body: projectStory('nassarawa-story', 'Comfort came from the section', [
      'The brief asked for a public reading room that could stay useful through heat and power cuts. Thick earth walls slow the day’s heat, deep roofs protect the openings and a high chimney draws warm air out of the centre.',
      'Courtyards break the library into smaller, shaded rooms where children, students and elders can read at the same time. The building uses familiar materials in a precise new way, so maintenance can remain local.',
    ]),
    coverImage: placeholderImage,
    coverImageUrl: '/images/projects/nassarawa-civic-library.jpg',
    galleryImageUrls: [
      {
        src: '/images/projects/gallery/nassarawa-library-exterior.webp',
        alt: 'Low rammed-earth Nassarawa Civic Library with deep shaded walkways in Kano',
        caption:
          'Earth walls, deep overhangs and shaded courts form the building’s first line of cooling.',
      },
      {
        src: '/images/projects/gallery/nassarawa-library-reading-room.webp',
        alt: 'Naturally cooled reading room inside Nassarawa Civic Library',
        caption: 'High vents and a thermal chimney draw warm air above the occupied reading space.',
      },
    ],
    featured: false,
    order: 5,
  },
  {
    _id: 'p-6',
    title: 'Oniru Penthouse',
    slug: 'oniru-penthouse',
    tagline: 'One floor, stripped back to the view',
    category: 'interior',
    status: 'completed',
    location: 'Oniru, Lagos',
    year: '2024',
    area: '420 m²',
    duration: '7 months',
    excerpt:
      'We removed four walls and a dropped ceiling. What was left was a lagoon view the original plan had hidden behind a corridor.',
    body: projectStory('oniru-story', 'The view had been there all along', [
      'The original plan used its best edge as circulation. We removed four internal walls, collected the services into a compact spine and gave the lagoon back to the rooms where the family spends its time.',
      'Limestone floors run from the living room onto the planted terrace. Iroko joinery and quiet brass details warm the open plan without competing with the water and changing Lagos sky.',
    ]),
    coverImage: placeholderImage,
    coverImageUrl: '/images/projects/oniru-penthouse.jpg',
    galleryImageUrls: [
      {
        src: '/images/projects/gallery/oniru-penthouse-living.webp',
        alt: 'Oniru Penthouse living room opening toward the Lagos lagoon',
        caption: 'Removing the corridor placed the lagoon at the centre of the living space.',
      },
      {
        src: '/images/projects/gallery/oniru-penthouse-kitchen.webp',
        alt: 'Open kitchen and dining room facing a planted terrace at Oniru Penthouse',
        caption: 'Kitchen, dining and terrace now share one uninterrupted line to the water.',
      },
    ],
    featured: false,
    order: 6,
  },
];

// ---------------------------------------------------------------------------
// Microcopy
// ---------------------------------------------------------------------------

/**
 * Every user-facing string that is not a heading. Centralised so tone stays
 * consistent and so a copy review is one file, not forty components.
 */
export const COPY = {
  form: {
    submit: 'Send enquiry',
    submitting: 'Sending…',
    successTitle: 'Got it. Thank you.',
    successBody:
      'Your enquiry is with the studio. Someone who can actually answer it will reply within two working days.',
    errorTitle: 'That did not send.',
    errorBody:
      'Something failed on our side, not yours. Try once more, or email studio@dickalo.com and we will pick it up there.',
    required: 'Required',
    optional: 'Optional',
    consent: 'I am happy for DICKALO to reply to this enquiry by email or phone.',
    privacyNote: 'We use your details only to answer your enquiry.',
  },
  subscribe: {
    heading: 'New projects, twice a year',
    body: 'We send an email when a building finishes. No newsletters, no offers, no drip campaigns.',
    placeholder: 'you@company.com',
    submit: 'Subscribe',
    submitting: 'Adding you…',
    success: 'You are on the list. Look out for us in about six months.',
    alreadySubscribed: 'You are already on the list. Nothing more to do.',
  },
  empty: {
    projects: 'No projects match that filter yet.',
    projectsAction: 'Clear the filter to see everything we have built.',
    generic: 'Nothing to show here yet.',
  },
  errors: {
    notFoundTitle: 'This page is not here.',
    notFoundBody:
      'The link may be old, or we may have moved the page. Everything we have built is still one click away.',
    genericTitle: 'Something broke on our side.',
    genericBody:
      'Not your fault. Reloading usually clears it. If it does not, tell us what you were doing and we will fix it.',
    retry: 'Try again',
    goHome: 'Back to homepage',
  },
  loading: 'Loading',
  skipToContent: 'Skip to main content',
} as const;

// ---------------------------------------------------------------------------
// Technical constants
// ---------------------------------------------------------------------------

/** How many projects to load per page on the portfolio grid. */
export const PROJECTS_PER_PAGE = 9;

/** ISR window for CMS-backed pages, in seconds. */
export const REVALIDATE_SECONDS = 60 * 30;

/** Simple in-memory rate limit for public POST endpoints. */
export const RATE_LIMIT = {
  windowMs: 60_000,
  maxRequests: 5,
} as const;

/**
 * Hero footage.
 *
 * `webm` is optional and currently absent. A <source> pointing at a missing
 * file costs a failed request on every load before the browser falls through
 * to the mp4, so the hero only renders the webm source when this is set.
 * Add a VP9 encode and set the path to halve the transfer in Chrome and
 * Firefox — see public/ASSETS.md.
 */
export const HERO_VIDEO = {
  src: '/videos/hero.mp4',
  webm: null as string | null,
  poster: '/images/hero-poster.jpg',
} as const;
