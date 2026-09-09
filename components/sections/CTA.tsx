import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { FadeInScroll } from '@/components/animations/FadeInScroll';
import { siteConfig } from '@/config/site';

export interface CTAProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
}
export function CTA({
  eyebrow = 'Your vision. Our next chapter.',
  title,
  description = 'A place to live. A space to grow. An idea that deserves to be built. Tell us what you have in mind — let’s make something exceptional.',
  primaryLabel = 'Start a conversation',
  primaryHref = '/contact',
}: CTAProps) {
  return (
    <section id="start-a-project" className="closing-cta on-inverse" aria-labelledby="cta-heading">
      <div className="cta-drawing" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <Container>
        <FadeInScroll>
          <p className="micro-label">
            <span className="label-dot" /> {eyebrow}
          </p>
          <h2 id="cta-heading">
            {title || (
              <>
                Let’s build
                <br />
                something <span className="display-accent">remarkable.</span>
              </>
            )}
          </h2>
          <div className="cta-bottom">
            <p>{description}</p>
            <Button href={primaryHref} size="lg" iconRight={<span aria-hidden="true">↗</span>}>
              {primaryLabel}
            </Button>
          </div>
          <div className="cta-contact">
            <a href={`mailto:${siteConfig.contact.email}`}>
              {siteConfig.contact.email} <span aria-hidden="true">↗</span>
            </a>
            <span>We’ll be in touch {siteConfig.contact.responseTime}.</span>
          </div>
        </FadeInScroll>
      </Container>
    </section>
  );
}
