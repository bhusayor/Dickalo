import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * Project — the core content type.
 *
 * Field descriptions are written for the editor, not the developer: they say
 * what to type and how long it should be, because that is what keeps the site
 * consistent once developers stop watching.
 */
export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'details', title: 'Project details' },
    { name: 'media', title: 'Images' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Project name',
      type: 'string',
      group: 'content',
      description: 'How the project is referred to. Usually the building or the street.',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      group: 'content',
      description: 'Generated from the name. Changing this breaks existing links.',
      options: { source: 'title', maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'One-line claim',
      type: 'string',
      group: 'content',
      description:
        'The single most interesting thing about this project. Written as a claim, not a category. Example: "A family house designed around the harmattan, not against it."',
      validation: (rule) => rule.max(90).warning('Over 90 characters will wrap awkwardly on cards.'),
    }),
    defineField({
      name: 'excerpt',
      title: 'Card summary',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Two sentences maximum. Shown on project cards and in search results.',
      validation: (rule) => rule.required().min(40).max(220),
    }),
    defineField({
      name: 'body',
      title: 'Full story',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Body', value: 'normal' },
            { title: 'Heading', value: 'h2' },
            { title: 'Subheading', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [{ title: 'Bullet', value: 'bullet' }, { title: 'Numbered', value: 'number' }],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  { name: 'href', type: 'url', title: 'URL', validation: (r) => r.required() },
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt text',
              description: 'Describe what is in the image for people using a screen reader.',
              validation: (rule) => rule.required(),
            },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
        }),
      ],
    }),

    // --- Details -----------------------------------------------------------
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'details',
      options: {
        list: [
          { title: 'Residential', value: 'residential' },
          { title: 'Commercial', value: 'commercial' },
          { title: 'Hospitality', value: 'hospitality' },
          { title: 'Interior', value: 'interior' },
          { title: 'Mixed use', value: 'mixed-use' },
          { title: 'Institutional', value: 'institutional' },
        ],
        layout: 'radio',
      },
      initialValue: 'residential',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'details',
      options: {
        list: [
          { title: 'Completed', value: 'completed' },
          { title: 'On site', value: 'in-progress' },
          { title: 'Concept', value: 'concept' },
        ],
        layout: 'radio',
      },
      initialValue: 'completed',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      group: 'details',
      description: 'Neighbourhood and city, e.g. "Ikoyi, Lagos" or "Wuse II, Abuja".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
      group: 'details',
      description: 'Completion year. A range is fine for phased work, e.g. "2022–2024".',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'client', title: 'Client', type: 'string', group: 'details' }),
    defineField({
      name: 'area',
      title: 'Floor area',
      type: 'string',
      group: 'details',
      description: 'Include the unit, e.g. "4,200 m²".',
    }),
    defineField({
      name: 'duration',
      title: 'Build duration',
      type: 'string',
      group: 'details',
      description: 'e.g. "16 months".',
    }),
    defineField({
      name: 'services',
      title: 'Services provided',
      type: 'array',
      group: 'details',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'facts',
      title: 'Detail sidebar',
      type: 'array',
      group: 'details',
      description: 'Extra facts shown beside the project story. Three to six reads best.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            { name: 'label', type: 'string', title: 'Label', validation: (r) => r.required() },
            { name: 'value', type: 'string', title: 'Value', validation: (r) => r.required() },
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        }),
      ],
    }),

    // --- Media -------------------------------------------------------------
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      group: 'media',
      description: 'Landscape, at least 2000px wide. This is the first thing anyone sees.',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (rule) => rule.required(),
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      group: 'media',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt text', validation: (r) => r.required() },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
        }),
      ],
      options: { layout: 'grid' },
    }),

    // --- Placement ---------------------------------------------------------
    defineField({
      name: 'featured',
      title: 'Show on homepage',
      type: 'boolean',
      group: 'content',
      description: 'Four featured projects show on the homepage, in the order below.',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      group: 'content',
      description: 'Lower numbers appear first. Leave empty to sort by date added.',
    }),

    // --- SEO ---------------------------------------------------------------
    defineField({
      name: 'seo',
      title: 'Search and sharing',
      type: 'object',
      group: 'seo',
      options: { collapsible: true, collapsed: true },
      fields: [
        {
          name: 'metaTitle',
          type: 'string',
          title: 'Search title',
          description: 'Overrides the project name in search results. Under 60 characters.',
          validation: (rule) => rule.max(60),
        },
        {
          name: 'metaDescription',
          type: 'text',
          rows: 2,
          title: 'Search description',
          description: 'Google shows about 155 characters. Say what is interesting, not what it is.',
          validation: (rule) => rule.max(160),
        },
        {
          name: 'ogImage',
          type: 'image',
          title: 'Social sharing image',
          description: '1200 × 630. Falls back to the cover image if empty.',
        },
        {
          name: 'noIndex',
          type: 'boolean',
          title: 'Hide from search engines',
          initialValue: false,
        },
      ],
    }),
  ],

  orderings: [
    { title: 'Sort order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Newest first', name: 'createdDesc', by: [{ field: '_createdAt', direction: 'desc' }] },
    { title: 'Name A–Z', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
  ],

  preview: {
    select: { title: 'title', category: 'category', location: 'location', year: 'year', media: 'coverImage' },
    prepare({ title, category, location, year, media }) {
      return {
        title,
        subtitle: [category, location, year].filter(Boolean).join(' · '),
        media,
      };
    },
  },
});
