import type { StructureResolver } from 'sanity/structure';

/**
 * Studio navigation.
 *
 * Two things this buys us over the default list:
 * 1. Site settings is a true singleton — one fixed document id, no "create new".
 * 2. Projects are pre-filtered by status, which is how the studio actually
 *    thinks about them.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('DICKALO')
    .items([
      S.listItem()
        .title('Projects')
        .child(
          S.list()
            .title('Projects')
            .items([
              S.listItem()
                .title('All projects')
                .child(S.documentTypeList('project').title('All projects')),
              S.listItem()
                .title('On the homepage')
                .child(
                  S.documentList()
                    .title('Featured projects')
                    .filter('_type == "project" && featured == true')
                    .defaultOrdering([{ field: 'order', direction: 'asc' }]),
                ),
              S.listItem()
                .title('On site')
                .child(
                  S.documentList()
                    .title('Currently building')
                    .filter('_type == "project" && status == "in-progress"'),
                ),
              S.listItem()
                .title('Completed')
                .child(
                  S.documentList()
                    .title('Completed')
                    .filter('_type == "project" && status == "completed"'),
                ),
            ]),
        ),

      S.divider(),

      S.listItem().title('Services').child(S.documentTypeList('service').title('Services')),
      S.listItem().title('Team').child(S.documentTypeList('teamMember').title('Team')),
      S.listItem()
        .title('Testimonials')
        .child(S.documentTypeList('testimonial').title('Testimonials')),

      S.divider(),

      // Singleton: fixed id, no list, no delete.
      S.listItem()
        .title('Site settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ]);

/** Document types the editor should never be able to create more than one of. */
export const singletonTypes = new Set(['siteSettings']);
