import { Container } from '@/components/common/Container';
import { PageHeader } from '@/components/common/PageHeader';
import { ContactForm } from '@/components/forms/ContactForm';
import { FadeInScroll } from '@/components/animations/FadeInScroll';
import { siteConfig } from '@/config/site';

/**
 * Contact page.
 *
 * The sidebar answers the questions people have while filling in a form:
 * how long until someone replies, who reads it, and what happens next. Answering
 * them beside the form is the difference between a submitted enquiry and an
 * abandoned one.
 */
const WHAT_HAPPENS = [
  {
    step: '01',
    title: 'A person reads it',
    body: 'Not a queue and not a chatbot. One of the four directors sees every enquiry that comes in.',
  },
  {
    step: '02',
    title: 'We reply within two working days',
    body: 'With a real answer: whether we can take it, roughly what it costs, and what we would need to know next.',
  },
  {
    step: '03',
    title: 'We visit the site',
    body: 'If it looks like a fit, we come and stand on it. That visit is free and comes with no expectation.',
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Tell us what you are building."
        description="The more concrete you are, the more useful our first reply will be. Plot size, what you want on it, and when you would like to be in. Guesses are fine — we will tell you which ones matter."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
        titleClassName="max-w-[16ch]"
        className="pb-14 lg:pb-20"
      />

      <section className="section-space bg-surface-base">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1.25fr_0.75fr] lg:gap-24">
            <FadeInScroll>
              <ContactForm />
            </FadeInScroll>

            <FadeInScroll delay={0.12} direction="none">
              <div className="flex flex-col gap-12 lg:sticky lg:top-28">
                <div className="flex flex-col gap-5">
                  <h2 className="eyebrow eyebrow--muted">What happens next</h2>
                  <ol className="flex flex-col gap-6">
                    {WHAT_HAPPENS.map((item) => (
                      <li key={item.step} className="flex gap-4">
                        <span className="numeric shrink-0 pt-0.5 font-display text-caption text-content-accent/70">
                          {item.step}
                        </span>
                        <span className="flex flex-col gap-1.5">
                          <span className="text-body-md font-medium text-content-primary">
                            {item.title}
                          </span>
                          <span className="text-body-sm text-content-muted">{item.body}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex flex-col gap-4 border-t border-line pt-8">
                  <h2 className="eyebrow eyebrow--muted">Or skip the form</h2>
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="link-underline w-fit text-body-lg text-content-primary"
                  >
                    {siteConfig.contact.email}
                  </a>
                  <a
                    href={`tel:${siteConfig.contact.phoneRaw}`}
                    className="link-underline w-fit text-body-lg text-content-primary"
                  >
                    {siteConfig.contact.phone}
                  </a>
                  <a
                    href={siteConfig.contact.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline w-fit text-body-md text-content-accent"
                  >
                    Message us on WhatsApp
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  <p className="pt-1 text-caption text-content-faint">{siteConfig.hours.label}</p>
                </div>

                <div className="flex flex-col gap-3 border-t border-line pt-8">
                  <h2 className="eyebrow eyebrow--muted">The studio</h2>
                  <address className="text-body-md not-italic leading-relaxed text-content-secondary">
                    {siteConfig.address.street}
                    <br />
                    {siteConfig.address.district}
                    <br />
                    {siteConfig.address.city}, {siteConfig.address.country}
                  </address>
                  <a
                    href={siteConfig.address.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline w-fit text-caption text-content-accent"
                  >
                    Get directions
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </div>
              </div>
            </FadeInScroll>
          </div>
        </Container>
      </section>
    </>
  );
}
