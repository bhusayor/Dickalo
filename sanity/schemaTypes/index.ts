import type { SchemaTypeDefinition } from 'sanity';

import { project } from './project';
import { service } from './service';
import { siteSettings } from './settings';
import { teamMember } from './team';
import { testimonial } from './testimonial';

/** Every document type registered with the Studio. */
export const schemaTypes: SchemaTypeDefinition[] = [
  project,
  service,
  teamMember,
  testimonial,
  siteSettings,
];

export { project, service, teamMember, testimonial, siteSettings };
