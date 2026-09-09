import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * Global settings. A singleton — `sanity/structure.ts` pins it to one document
 * so an editor cannot accidentally create a second copy.
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'contact', title: 'Contact' },
    { name: 'stats', title: 'Statistics' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Site title',
      type: 'string',
      group: 'general',
      initialValue: 'DICKALO',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Site description',
      type: 'text',
      rows: 3,
      group: 'general',
      description: 'Shown in search results and on shared links. Under 160 characters.',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'ogImage',
      title: 'Default sharing image',
      type: 'image',
      group: 'general',
      description: '1200 × 630. Used when a page has no image of its own.',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      group: 'contact',
      validation: (rule) => rule.required().email(),
    }),
    defineField({ name: 'phone', title: 'Phone', type: 'string', group: 'contact' }),
    defineField({ name: 'address', title: 'Address', type: 'text', rows: 3, group: 'contact' }),
    defineField({
      name: 'socials',
      title: 'Social links',
      type: 'array',
      group: 'contact',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            {
              name: 'platform',
              type: 'string',
              title: 'Platform',
              options: {
                list: ['Instagram', 'LinkedIn', 'Behance', 'YouTube', 'X', 'Facebook'],
              },
              validation: (r) => r.required(),
            },
            { name: 'url', type: 'url', title: 'URL', validation: (r) => r.required() },
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        }),
      ],
    }),
    defineField({
      name: 'stats',
      title: 'Headline numbers',
      type: 'array',
      group: 'stats',
      description: 'Four numbers show on the homepage. Only publish figures you can defend.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            { name: 'label', type: 'string', title: 'Label', validation: (r) => r.required() },
            { name: 'value', type: 'number', title: 'Value', validation: (r) => r.required() },
            {
              name: 'suffix',
              type: 'string',
              title: 'Suffix',
              description: 'e.g. "+" or "%".',
            },
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
