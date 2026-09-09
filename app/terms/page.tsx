import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/PageHeader';
import { Container } from '@/components/common/Container';
import { siteConfig } from '@/config/site';
import { buildMetadata, pageMeta } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata(pageMeta.terms);

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Website terms"
        description="The terms that apply when you browse this website or send the studio an enquiry."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Terms' }]}
      />

      <section className="section-space bg-surface-base">
        <Container width="prose">
          <article className="prose-dickalo">
            <p className="text-caption text-content-muted">Last updated 8 September 2026</p>

            <h2>About this website</h2>
            <p>
              This website is operated by {siteConfig.legalName}. It presents our studio, services
              and selected work. By using it, you agree to these website terms.
            </p>

            <h2>Project enquiries are not contracts</h2>
            <p>
              Sending a form, email or message does not appoint DICKALO and does not create an
              architect-client, contractor-client or advisory relationship. A project begins only
              when both parties sign a separate written agreement that sets out the scope, fees,
              programme and responsibilities.
            </p>

            <h2>Portfolio information</h2>
            <p>
              Project descriptions, dates, areas and images are provided to explain our work. We
              take reasonable care with them, but they are not estimates or promises for a future
              project. Every site, approval route, brief and market price is different.
            </p>

            <h2>Ownership and permitted use</h2>
            <p>
              Unless otherwise stated, the text, drawings, photographs, video, branding and website
              design belong to DICKALO or are used with permission. You may view and share links to
              the site for personal or professional reference. You may not reproduce, sell or
              present its content as your own without written permission.
            </p>

            <h2>Availability and external links</h2>
            <p>
              We may update, move or remove site content without notice. Links to third-party
              websites are provided for convenience; we do not control their content, security or
              privacy practices.
            </p>

            <h2>Contact</h2>
            <p>
              Questions about these terms can be sent to{' '}
              <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>.
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
