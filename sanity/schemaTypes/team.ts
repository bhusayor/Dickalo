import { defineArrayMember, defineField, defineType } from 'sanity';

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team member',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'Their actual job title, as it appears on a contract.',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'bio',
      title: 'Short bio',
      type: 'text',
      rows: 3,
      description:
        'Two sentences. Say what they do and what they have done, not how passionate they are.',
      validation: (rule) => rule.max(280),
    }),
    defineField({
      name: 'image',
      title: 'Portrait',
      type: 'image',
      description: 'Portrait orientation, at least 1200px tall.',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'credentials',
      title: 'Credentials',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Registrations and degrees, e.g. "ARCON registered".',
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn',
      type: 'url',
      validation: (rule) => rule.uri({ scheme: ['https'] }),
    }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      description: 'Lower numbers appear first.',
    }),
  ],
  orderings: [{ title: 'Sort order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'role', media: 'image' } },
});
