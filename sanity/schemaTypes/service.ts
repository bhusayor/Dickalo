import { defineArrayMember, defineField, defineType } from 'sanity';

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Service name',
      type: 'string',
      description: 'Plain language. "Construction", not "Integrated Delivery Solutions".',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'slug',
      title: 'Anchor',
      type: 'slug',
      description: 'Used to link to this service from elsewhere on the site.',
      options: { source: 'title', maxLength: 60 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'The promise',
      type: 'text',
      rows: 3,
      description:
        'One or two sentences saying what the client gets. Concrete beats impressive. Example: "One contract, one accountable team."',
      validation: (rule) => rule.required().min(40).max(220),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: [
          { title: 'Drawing board', value: 'draft' },
          { title: 'Crane / build', value: 'build' },
          { title: 'Interior', value: 'interior' },
          { title: 'Management', value: 'manage' },
          { title: 'Restoration', value: 'restore' },
          { title: 'Consultancy', value: 'consult' },
        ],
      },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'deliverables',
      title: 'What you receive',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Three to five items. Things a client can hold, not qualities.',
      validation: (rule) => rule.max(6).warning('More than six items stops being scannable.'),
    }),
    defineField({
      name: 'description',
      title: 'Long description',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
      description: 'Optional. Shown on the services page under the summary.',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      description: 'Lower numbers appear first.',
    }),
  ],
  orderings: [{ title: 'Sort order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'summary', media: 'image' },
  },
});
