import { defineField, defineType } from 'sanity';

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      description:
        'Use their words. A specific complaint they no longer have is worth more than three sentences of praise.',
      validation: (rule) => rule.required().min(40).max(400),
    }),
    defineField({
      name: 'author',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'e.g. "Managing Director" or "Homeowner".',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'company', title: 'Company or project', type: 'string' }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'project',
      title: 'Related project',
      type: 'reference',
      to: [{ type: 'project' }],
      description: 'Optional. Links the quote to the building it is about.',
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (rule) => rule.min(1).max(5).integer(),
    }),
    defineField({
      name: 'featured',
      title: 'Show on homepage',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { quote: 'quote', author: 'author', company: 'company', media: 'image' },
    prepare({ quote, author, company, media }) {
      return {
        title: author,
        subtitle: company ? `${company} — ${String(quote).slice(0, 60)}…` : String(quote).slice(0, 70),
        media,
      };
    },
  },
});
