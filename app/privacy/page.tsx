import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/PageHeader';
import { Container } from '@/components/common/Container';
import { siteConfig } from '@/config/site';
import { buildMetadata, pageMeta } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata(pageMeta.privacy);

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        description="What we collect when you contact the studio, why we need it, and the choices you have."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Privacy' }]}
      />

      <section className="section-space bg-surface-base">
        <Container width="prose">
          <article className="prose-dickalo">
            <p className="text-caption text-content-muted">Last updated 8 September 2026</p>

            <h2>Information you give us</h2>
            <p>
              When you send a project enquiry, we collect the contact and project details you enter,
              such as your name, email address, phone number, location, budget, preferred timeline
              and message. If you join the mailing list, we collect your email address and the page
              where you subscribed.
            </p>

            <h2>Information collected automatically</h2>
            <p>
              Our hosting providers may record basic technical information needed to deliver and
              protect the site, including browser details, request times and IP addresses. Where we
              use an IP address to prevent repeated or abusive submissions, it is salted and hashed
              before storage.
            </p>

            <h2>How we use information</h2>
            <ul>
              <li>To review and respond to enquiries.</li>
              <li>To plan a site visit or continue a project conversation you requested.</li>
              <li>To send studio updates when you have subscribed.</li>
              <li>To keep forms secure, prevent abuse and diagnose service problems.</li>
            </ul>
            <p>We do not sell personal information or use it for third-party advertising.</p>

            <h2>Who processes it</h2>
            <p>
              We use specialist providers to run this website and communicate with you. These may
              include Vercel for hosting, Supabase for secure submission storage and Resend for
              email delivery. They process information only to provide those services to us.
            </p>

            <h2>Retention and your choices</h2>
            <p>
              We keep enquiry records only for as long as they are useful for the conversation, our
              business records or a legal obligation. You can ask what information we hold, request
              a correction or deletion, or unsubscribe from studio updates at any time.
            </p>

            <h2>Contact</h2>
            <p>
              For a privacy request, email{' '}
              <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>. You can
              also write to {siteConfig.address.street}, {siteConfig.address.district},{' '}
              {siteConfig.address.city}, {siteConfig.address.country}.
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
