'use client';

import NextImage from 'next/image';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/common/Button';
import { ArrowUpRight } from '@/components/common/NavigationIcons';
import { useSmoothScroll } from '@/components/layout/SmoothScrollProvider';
import { gsap, registerGsap, ScrollTrigger } from '@/lib/animations/gsapAnimations';

const imageSizes = '(max-width: 600px) 1200px, (max-width: 900px) 1400px, 100vw';

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reveal = useRef<gsap.core.Timeline | null>(null);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    registerGsap();
    const media = gsap.matchMedia();
    let cancelled = false;
    let model:
      | ReturnType<typeof import('@/lib/animations/constructionScene').mountConstructionScene>
      | undefined;
    const fallback = () => {
      media.revert();
      model?.dispose();
      model = undefined;
      if (track.current) track.current.dataset.scene = 'fallback';
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      fallback();
    };
    const element = canvas.current;
    element?.addEventListener('webglcontextlost', contextLost);
    import('@/lib/animations/constructionScene')
      .then(async ({ mountConstructionScene }) => {
        if (cancelled || !element) return;
        model = mountConstructionScene(element);
        media.add('(prefers-reduced-motion: reduce)', () => {
          model?.render(1);
        });
        media.add('(prefers-reduced-motion: no-preference)', () => {
          const context = gsap.context(() => {
            const construction = { progress: 0 };
            const story = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                id: 'hero-construction',
                trigger: track.current,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.35,
              },
              onUpdate: () => {
                const progress = construction.progress;
                model?.render(progress);
                section.current?.setAttribute('data-hero-progress', progress.toFixed(3));
                section.current?.setAttribute(
                  'data-hero-state',
                  progress < 0.15
                    ? 'foundation'
                    : progress < 0.65
                      ? 'structure'
                      : progress < 0.84
                        ? 'finishing'
                        : 'complete',
                );
              },
            });
            reveal.current = story;
            section.current?.setAttribute('data-hero-state', 'foundation');
            section.current?.setAttribute('data-hero-progress', '0');
            model?.render(0);
            // One model and one camera for the entire scroll. Each construction
            // component grows from its base at its own point in this shared timeline.
            story
              .fromTo(construction, { progress: 0 }, { progress: 1, duration: 1 }, 0)
              .fromTo(
                '[data-hero-line]',
                { y: 0, yPercent: 110, opacity: 0 },
                { y: 0, yPercent: 0, opacity: 1, duration: 0.2, stagger: 0.06, ease: 'power2.out' },
                0.7,
              )
              .fromTo(
                '.hero-overline',
                { y: 18, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.2 },
                0.66,
              )
              .fromTo(
                '.hero-bottom-row',
                { y: 24, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.16 },
                0.84,
              );
            ScrollTrigger.refresh();
            // A restored scroll position must be drawn before revealing the canvas.
            story.progress(story.scrollTrigger?.progress ?? 0);
          }, section);
          return () => {
            reveal.current = null;
            context.revert();
          };
        });
        const mountedModel = model;
        await mountedModel.prepare();
        if (!cancelled && model === mountedModel && track.current) {
          track.current.dataset.scene = 'ready';
        }
      })
      .catch(() => {
        if (!cancelled) fallback();
      });
    return () => {
      cancelled = true;
      media.revert();
      model?.dispose();
      element?.removeEventListener('webglcontextlost', contextLost);
    };
  }, []);

  return (
    <div ref={track} className="hero-scroll-track" data-scene="loading">
      <section
        ref={section}
        id="hero"
        className="architecture-hero construction-hero"
        aria-labelledby="hero-heading"
      >
        <div className="hero-media">
          <div className="hero-construction-fallback">
            <NextImage
              src="/images/generated/courtyard-residence.webp"
              alt="A contemporary Nigerian courtyard residence with a landscaped garden"
              fill
              priority
              sizes={imageSizes}
              quality={90}
            />
          </div>
          <canvas
            ref={canvas}
            className="hero-construction-canvas"
            role="img"
            aria-label="A Nigerian garden-house concept assembling in place as you scroll, from its foundation and concrete frame through walls, roof, glazing and landscaping"
          />
        </div>
        <div className="hero-scrim" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-topline" data-hero-detail>
          <span className="micro-label hero-location">Rooted in Nigeria. Built to last.</span>
        </div>
        <div className="hero-content">
          <p className="micro-label hero-overline" data-hero-detail>
            We see what a place can become.
          </p>
          <h1 id="hero-heading">
            <span className="hero-line-mask">
              <span data-hero-line>Beyond buildings.</span>
            </span>
            <span className="hero-line-mask">
              <span data-hero-line>
                We bring spaces <span className="display-accent">to life.</span>
              </span>
            </span>
          </h1>
          <div className="hero-bottom-row" data-hero-detail>
            <p>
              From untapped potential to a place that feels like home.
              <br className="hidden sm:block" /> Considered design. Precise construction. A new
              beginning.
            </p>
            <Button href="/projects" size="lg" iconRight={<ArrowUpRight />}>
              Explore our work
            </Button>
          </div>
        </div>
        <div className="hero-foot" data-hero-detail>
          <button
            type="button"
            className="hero-scroll"
            onClick={() => {
              const trigger = reveal.current?.scrollTrigger;
              if (trigger && trigger.progress < 0.9) scrollTo(trigger.end);
              else scrollTo('#studio-intro', -90);
            }}
          >
            <span aria-hidden="true">↓</span> Scroll to build it
          </button>
        </div>
        <noscript>
          <style>{`
          .hero-scroll-track { height: auto !important; }
          .hero-construction-canvas { display: none !important; }
          .hero-construction-fallback { display: block !important; }
          .hero-scroll-track [data-hero-line] { transform: none; opacity: 1; }
          .hero-scroll-track .hero-overline, .hero-scroll-track .hero-bottom-row { opacity: 1; visibility: visible; }
        `}</style>
        </noscript>
      </section>
    </div>
  );
}
