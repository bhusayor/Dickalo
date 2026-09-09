import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { FadeInScroll } from '@/components/animations/FadeInScroll';
import { BrandMark } from '@/components/common/BrandMark';

export function StudioIntro() {
  return (
    <section id="studio-intro" className="studio-intro section-space">
      <Container>
        <FadeInScroll className="intro-layout">
          <div className="intro-label">
            <p className="micro-label">
              <span className="label-dot" /> The DICKALO perspective
            </p>
            <BrandMark className="intro-mark" />
          </div>
          <div>
            <h2 className="editorial-heading">
              Great spaces begin with
              <br className="hidden lg:block" /> a different way of{' '}
              <span className="display-accent">seeing.</span>
            </h2>
            <div className="intro-bottom">
              <p>
                We’re architects, builders, and problem solvers. United by a belief that the spaces
                around us should do more than look beautiful — they should make life better. From
                Lagos to beyond, we bring your vision to life, with one team from beginning to end.
              </p>
              <Button href="/about" iconRight={<span aria-hidden="true">↗</span>}>
                Inside our studio
              </Button>
            </div>
          </div>
        </FadeInScroll>
      </Container>
    </section>
  );
}
