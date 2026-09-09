'use client';

import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

import { apiVersion, dataset, projectId } from '@/lib/sanity/client';
import { schemaTypes } from '@/sanity/schemaTypes';
import { singletonTypes, structure } from '@/sanity/structure';

/**
 * Sanity Studio configuration.
 *
 * The Studio is mounted at /studio inside this Next.js app, so editors do not
 * need a separate deployment and previews share the site's session.
 */
export default defineConfig({
  name: 'dickalo',
  title: 'DICKALO Studio',
  basePath: '/studio',

  projectId: projectId || 'placeholder',
  dataset,

  schema: {
    types: schemaTypes,
    // Remove "create" from the global new-document menu for singletons.
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },

  document: {
    // Singletons cannot be duplicated, unpublished or deleted.
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : input,
  },

  plugins: [
    structureTool({ structure }),
    // Vision is a GROQ playground. Kept out of production to reduce bundle size.
    ...(process.env.NODE_ENV === 'development' ? [visionTool({ defaultApiVersion: apiVersion })] : []),
  ],
});
