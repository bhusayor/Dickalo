export interface ServiceDetailStep {
  title: string;
  description: string;
  deliverable: string;
}

export interface ServiceDetailFaq {
  question: string;
  answer: string;
}

export interface ServiceDetail {
  slug: string;
  headline: string;
  introduction: string;
  heroImage: { src: string; alt: string };
  storyTitle: string;
  story: string[];
  bestFor: string[];
  processIntroduction: string;
  process: ServiceDetailStep[];
  faqs: ServiceDetailFaq[];
  relatedProjectSlugs: string[];
}

export const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  'architectural-design': {
    slug: 'architectural-design',
    headline: 'A buildable idea, resolved before site.',
    introduction:
      'We turn the site, brief and budget into architecture that belongs to its climate and can be priced, approved and constructed without guesswork.',
    heroImage: {
      src: '/images/projects/gallery/banana-island-courtyard.webp',
      alt: 'Climate-responsive residential courtyard designed for shade and cross-ventilation',
    },
    storyTitle: 'The drawing must survive the site',
    story: [
      'A beautiful concept is only the beginning. We test every early move against orientation, structure, approvals, services and cost, so the architecture becomes more convincing as it becomes more detailed.',
      'Our architects work beside the people who will price and build the work. That shortens the distance between an idea and a reliable set of construction documents.',
    ],
    bestFor: [
      'New homes and residential developments',
      'Commercial, hospitality and institutional buildings',
      'Clients who need planning and approval drawings',
      'Projects that need design and cost decisions developed together',
    ],
    processIntroduction:
      'Each stage answers a different risk before the next stage begins. You approve the direction, scope and cost checkpoints as the design develops.',
    process: [
      {
        title: 'Brief and site',
        description:
          'We visit the site, study its climate and planning constraints, and turn your priorities into a written brief.',
        deliverable: 'Site report and approved brief',
      },
      {
        title: 'Concept',
        description:
          'Plans, massing and material direction are developed alongside an initial area schedule and cost range.',
        deliverable: 'Concept presentation and cost check',
      },
      {
        title: 'Coordination',
        description:
          'Architecture, structure and building services are resolved into one coordinated information set.',
        deliverable: 'Coordinated design package',
      },
      {
        title: 'Approvals and construction',
        description:
          'We complete the statutory submission and issue the drawings, schedules and details required to build.',
        deliverable: 'Approval and construction drawings',
      },
    ],
    faqs: [
      {
        question: 'Can we appoint DICKALO for design without construction?',
        answer:
          'Yes. We can provide architectural design as a standalone appointment, coordinate your consultants and issue a complete package for your chosen contractor.',
      },
      {
        question: 'Will you handle planning approval?',
        answer:
          'Yes. We prepare the architectural submission, coordinate the required consultant information and manage responses from the relevant authority. Statutory fees are identified separately.',
      },
      {
        question: 'When will we understand the likely construction cost?',
        answer:
          'The first range is tested during concept design. It becomes more precise as areas, structure, services and materials are agreed, before construction documents are completed.',
      },
    ],
    relatedProjectSlugs: ['banana-island-residence', 'meridian-tower'],
  },
  construction: {
    slug: 'construction',
    headline: 'A site run by one accountable team.',
    introduction:
      'We manage labour, structure, procurement, quality and reporting under one contract, with the people making decisions close to the work.',
    heroImage: {
      src: '/images/lagos-construction-poster.jpg',
      alt: 'Construction team working on a concrete building frame in Lagos',
    },
    storyTitle: 'Certainty comes from control',
    story: [
      'A programme is only useful when the site team, supply chain and design information move together. We build the structural work ourselves and coordinate specialist trades against one live sequence.',
      'Every week you see progress, decisions, spend to date and the work ahead. When a risk appears, it comes with an owner and a recovery action rather than a surprise at the end of the month.',
    ],
    bestFor: [
      'New residential and commercial buildings',
      'Clients who want a single construction contract',
      'Projects requiring controlled phased delivery',
      'Completed designs that need buildability and cost review',
    ],
    processIntroduction:
      'The site programme is broken into measurable stages with inspections and cost reporting built into the work rather than added afterwards.',
    process: [
      {
        title: 'Pre-construction',
        description:
          'We review drawings, quantities, logistics, procurement lead times and site risks before mobilisation.',
        deliverable: 'Contract programme and procurement schedule',
      },
      {
        title: 'Structure',
        description:
          'Earthworks, foundations and the primary frame are delivered with recorded inspections at each hold point.',
        deliverable: 'Quality records and structural milestones',
      },
      {
        title: 'Envelope and fit-out',
        description:
          'Roofing, facade, services and finishes are sequenced room by room to protect completed work.',
        deliverable: 'Weekly progress and cost report',
      },
      {
        title: 'Commission and handover',
        description:
          'Systems are tested, defects are closed and the operating information is assembled before occupation.',
        deliverable: 'Keys, warranties and as-built information',
      },
    ],
    faqs: [
      {
        question: 'Can you build from another architect’s drawings?',
        answer:
          'Yes. We begin with a buildability and coordination review, identify missing information and agree how design queries will be resolved before work starts.',
      },
      {
        question: 'How do you report progress and spending?',
        answer:
          'Clients receive a concise weekly report covering completed work, current photographs, decisions required and the next two weeks. Formal valuations track the agreed contract sum.',
      },
      {
        question: 'Do you work outside Lagos?',
        answer:
          'Yes. We establish a resident site team and adapt procurement and logistics to the location. The mobilisation plan and associated costs are agreed before appointment.',
      },
    ],
    relatedProjectSlugs: ['ogui-innovation-hub', 'nassarawa-civic-library'],
  },
  'interior-architecture': {
    slug: 'interior-architecture',
    headline: 'Rooms resolved at the scale of touch.',
    introduction:
      'We shape circulation, lighting, joinery, materials and furniture as one interior system, then coordinate the details through installation.',
    heroImage: {
      src: '/images/projects/gallery/oniru-penthouse-living.webp',
      alt: 'Warm contemporary Lagos penthouse interior facing the lagoon',
    },
    storyTitle: 'The detail is where the room becomes real',
    story: [
      'Interior architecture is more than choosing finishes. It begins with how people enter, move, gather, work and rest, then resolves every surface and service around those routines.',
      'We sample key materials early, draw the junctions that affect quality and confirm procurement before site work depends on it. The result feels calm because the difficult decisions have already been made.',
    ],
    bestFor: [
      'Private homes and apartments',
      'Hospitality, workplace and retail interiors',
      'Shell spaces requiring a complete fit-out',
      'Existing rooms that need a new plan and material identity',
    ],
    processIntroduction:
      'We move from use and atmosphere to precise information, procurement and installation, keeping one material and cost schedule throughout.',
    process: [
      {
        title: 'Understand the room',
        description:
          'We measure the space, map daily routines and agree the atmosphere, performance and storage needs.',
        deliverable: 'Measured survey and interior brief',
      },
      {
        title: 'Plan and material',
        description:
          'Layouts, lighting, key views and a tested material palette are developed together.',
        deliverable: 'Concept, sample board and cost range',
      },
      {
        title: 'Detail and procure',
        description:
          'Joinery, ceilings, lighting and finishes are coordinated while long-lead items are secured.',
        deliverable: 'Interior drawing and procurement package',
      },
      {
        title: 'Install and style',
        description:
          'We inspect the fit-out, close defects and place the final furniture, art and accessories.',
        deliverable: 'Completed, styled interior',
      },
    ],
    faqs: [
      {
        question: 'Can you work with furniture or art we already own?',
        answer:
          'Yes. We record the pieces at the start and design their placement, lighting and surrounding joinery as part of the room rather than treating them as an afterthought.',
      },
      {
        question: 'Do you source furniture and finishes?',
        answer:
          'Yes. We can source locally and internationally, provide samples for approval and track lead times, shipping and installation in one procurement schedule.',
      },
      {
        question: 'Can the interior be delivered in phases?',
        answer:
          'Yes. We can prioritise critical rooms or occupied areas, provided the service routes, procurement and temporary protection are planned before work begins.',
      },
    ],
    relatedProjectSlugs: ['oniru-penthouse', 'harbourline-hotel'],
  },
  'project-management': {
    slug: 'project-management',
    headline: 'Control the programme before it controls you.',
    introduction:
      'We coordinate consultants, contracts, cost, decisions and risk so the project moves with clear information and a single point of accountability.',
    heroImage: {
      src: '/images/projects/gallery/meridian-tower-exterior.webp',
      alt: 'Completed commercial tower representing coordinated project delivery',
    },
    storyTitle: 'Good management makes decisions visible',
    story: [
      'Most delays begin quietly: an unanswered drawing, an unapproved sample or a long-lead item discovered too late. We build the decision schedule alongside the construction programme so those risks appear while there is still time to act.',
      'The reporting stays concise. You see what changed, what it means for time and cost, and who must decide next. The detailed records remain behind that clear weekly view.',
    ],
    bestFor: [
      'Clients managing several consultants or contractors',
      'Developments with lender or board reporting requirements',
      'Projects requiring independent cost and programme oversight',
      'Remote clients who need a reliable representative on site',
    ],
    processIntroduction:
      'We establish one baseline for scope, time and cost, then manage change against it until every contract and defect is closed.',
    process: [
      {
        title: 'Define control',
        description:
          'Scope, responsibilities, approvals, programme and reporting lines are agreed before appointments multiply.',
        deliverable: 'Project execution plan',
      },
      {
        title: 'Appoint and coordinate',
        description:
          'We manage consultant information, tendering, contract recommendations and pre-start decisions.',
        deliverable: 'Appointment and tender record',
      },
      {
        title: 'Monitor delivery',
        description:
          'Programme, cost, quality, risk and change are reviewed through site meetings and clear actions.',
        deliverable: 'Live dashboard and weekly report',
      },
      {
        title: 'Close properly',
        description:
          'Completion, defects, accounts, warranties and building records are followed through to closure.',
        deliverable: 'Handover and close-out report',
      },
    ],
    faqs: [
      {
        question: 'Can you represent us when another contractor is building?',
        answer:
          'Yes. We can act as the client’s project manager, coordinate the professional team and monitor the contractor against the agreed contract, programme and quality requirements.',
      },
      {
        question: 'How early should a project manager be appointed?',
        answer:
          'Ideally before the consultant team and procurement route are fixed. Early appointment gives you more control over scope, reporting and the decisions that shape cost.',
      },
      {
        question: 'How are changes controlled?',
        answer:
          'Each proposed change is recorded with its reason, cost and programme effect. It proceeds only after the person with the agreed authority approves it.',
      },
    ],
    relatedProjectSlugs: ['meridian-tower', 'harbourline-hotel'],
  },
  'renovation-restoration': {
    slug: 'renovation-restoration',
    headline: 'Keep what is sound. Repair what is not.',
    introduction:
      'We investigate existing buildings before promising a solution, then combine careful repair with new structure, services and spaces that extend their useful life.',
    heroImage: {
      src: '/images/projects/gallery/ogui-hub-workspace.webp',
      alt: 'Restored warehouse interior with retained steel roof trusses in Enugu',
    },
    storyTitle: 'Existing buildings must be read before they are redrawn',
    story: [
      'Old drawings rarely tell the whole truth. We open up selected areas, survey the structure and trace existing services before fixing the scope. That evidence protects the design and the budget from avoidable assumptions.',
      'The aim is not to erase age. We retain elements with character and remaining life, repair them honestly and make new work legible without letting it overwhelm the original building.',
    ],
    bestFor: [
      'Homes requiring structural or services upgrades',
      'Commercial buildings being adapted to a new use',
      'Older buildings with valuable original fabric',
      'Occupied properties requiring phased work',
    ],
    processIntroduction:
      'Investigation comes first. The scope and price are built from what the building reveals, with contingency attached to specific remaining risks.',
    process: [
      {
        title: 'Survey and open up',
        description:
          'We record condition, structure and services, using targeted opening-up where hidden construction matters.',
        deliverable: 'Condition and risk report',
      },
      {
        title: 'Decide what stays',
        description:
          'Retained, repaired, replaced and new elements are mapped against the brief and available budget.',
        deliverable: 'Intervention strategy and cost range',
      },
      {
        title: 'Detail the interfaces',
        description:
          'New structure and services are coordinated carefully with the existing building and phased access.',
        deliverable: 'Construction and phasing package',
      },
      {
        title: 'Repair and adapt',
        description:
          'Work proceeds with inspections at uncovered conditions and an agreed method for approving change.',
        deliverable: 'Renewed building and updated records',
      },
    ],
    faqs: [
      {
        question: 'Can you give a fixed price before opening up the building?',
        answer:
          'We can price visible and documented work, but concealed conditions need investigation or a clearly stated allowance. We show that uncertainty rather than hiding it inside an unreliable fixed number.',
      },
      {
        question: 'Can we remain in the building during the work?',
        answer:
          'Sometimes. We assess access, dust, noise, temporary services and safety, then propose phases. Some structural or services work may still require parts of the building to be vacant.',
      },
      {
        question: 'Will you preserve original details?',
        answer:
          'Yes, where they are significant and repairable. We record them, test suitable repair methods and use new work to support their continued use rather than imitate them poorly.',
      },
    ],
    relatedProjectSlugs: ['ogui-innovation-hub', 'oniru-penthouse'],
  },
  'feasibility-consultancy': {
    slug: 'feasibility-consultancy',
    headline: 'Know what the land can carry before you commit.',
    introduction:
      'We test planning, access, climate, capacity, area and likely cost early enough for the answer to change a purchase, brief or investment decision.',
    heroImage: {
      src: '/images/projects/gallery/nassarawa-library-exterior.webp',
      alt: 'Climate-responsive public building studied against its site conditions in Kano',
    },
    storyTitle: 'A small study can prevent a very expensive assumption',
    story: [
      'A plot area does not equal a buildable area. Setbacks, access, parking, ground conditions, title restrictions, services and the intended use all shape what can be delivered and financed.',
      'We assemble those constraints into clear massing options and an order-of-cost range. The study is deliberately decision-focused: it tells you what is plausible, what needs verification and what could make the project unworkable.',
    ],
    bestFor: [
      'Buyers assessing land or an existing property',
      'Developers testing density, use and commercial capacity',
      'Organisations preparing an investment or funding case',
      'Clients who need an independent review before design begins',
    ],
    processIntroduction:
      'The scope is tailored to the decision in front of you, so effort goes into the questions that could change that decision.',
    process: [
      {
        title: 'Define the decision',
        description:
          'We establish what you need to decide, the information available and the assumptions that matter most.',
        deliverable: 'Study brief and information request',
      },
      {
        title: 'Review the site',
        description:
          'Planning, title information, access, utilities, climate and physical constraints are examined together.',
        deliverable: 'Constraints and opportunities plan',
      },
      {
        title: 'Test options',
        description:
          'Massing, area, use and servicing options are compared against the brief and likely approvals.',
        deliverable: 'Option study and area schedule',
      },
      {
        title: 'State the case',
        description:
          'The preferred direction, cost range, risks and next investigations are assembled for a clear decision.',
        deliverable: 'Feasibility report and recommendation',
      },
    ],
    faqs: [
      {
        question: 'Can you review a property before we buy it?',
        answer:
          'Yes. With access and the available title or survey information, we can identify physical and planning constraints and outline what should be verified by legal and specialist advisers.',
      },
      {
        question: 'Does a feasibility study include a full design?',
        answer:
          'No. It includes enough spatial and technical work to test capacity, compliance and cost. A full design begins after the preferred direction and brief are approved.',
      },
      {
        question: 'Can the report be used for funding discussions?',
        answer:
          'Yes. We can structure the report around the development case, areas, phasing, order-of-cost range and principal risks required for early lender or investor conversations.',
      },
    ],
    relatedProjectSlugs: ['nassarawa-civic-library', 'meridian-tower'],
  },
};

export const SERVICE_SLUGS = Object.keys(SERVICE_DETAILS);
