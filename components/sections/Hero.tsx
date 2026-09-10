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
  const reveal = useRef<gsap.core.Timeline | null>(null);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    registerGsap();
    const media = gsap.matchMedia();
    let cancelled = false;
    const ready = Array.from(section.current?.querySelectorAll('img') ?? []).map((image) =>
      image.decode().catch(() => {}),
    );
    Promise.all(ready).then(() => {
      if (cancelled) return;
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const context = gsap.context(() => {
          const story = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              id: 'hero-restoration',
              trigger: track.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
              invalidateOnRefresh: true,
            },
            onUpdate: () => {
              const progress = story.progress();
              section.current?.setAttribute('data-hero-progress', progress.toFixed(3));
              section.current?.setAttribute(
                'data-hero-state',
                progress < 0.22
                  ? 'foundation'
                  : progress < 0.48
                    ? 'structure'
                    : progress < 0.74
                      ? 'enclosure'
                      : 'complete',
              );
            },
          });
          reveal.current = story;
          section.current?.setAttribute('data-hero-state', 'foundation');
          section.current?.setAttribute('data-hero-progress', '0');
          story
            .fromTo('[data-hero-image]', { scale: 1.075 }, { scale: 1, duration: 1 }, 0)
            .fromTo(
              '.hero-stage-structure',
              { clipPath: 'inset(100% 0% 0% 0%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.28 },
              0.05,
            )
            .fromTo(
              '.hero-stage-shell',
              { clipPath: 'inset(100% 0% 0% 0%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.3 },
              0.3,
            )
            .fromTo(
              '.hero-stage-complete',
              { clipPath: 'inset(100% 0% 0% 0%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.35 },
              0.6,
            )
            .fromTo(
              '.hero-build-scan',
              { yPercent: 0, autoAlpha: 0 },
              { yPercent: -225, autoAlpha: 0.7, duration: 0.9 },
              0.05,
            )
            .to('.hero-build-scan', { autoAlpha: 0, duration: 0.05 }, 0.95)
            .fromTo('.hero-atmosphere', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.68)
            .fromTo(
              '[data-hero-line]',
              { y: 0, yPercent: 110, opacity: 0 },
              { y: 0, yPercent: 0, opacity: 1, duration: 0.28, stagger: 0.1, ease: 'power2.out' },
              0.43,
            )
            .fromTo(
              '.hero-overline',
              { y: 18, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.25 },
              0.4,
            )
            .fromTo(
              '.hero-bottom-row',
              { y: 24, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.28 },
              0.7,
            );
          ScrollTrigger.refresh();
        }, section);
        return () => {
          reveal.current = null;
          context.revert();
        };
      });
      media.add(
        '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
        () => {
          const element = section.current;
          if (!element) return;
          const camera = element.querySelector('.hero-camera');
          const light = element.querySelector('.hero-atmosphere');
          const moveX = gsap.quickTo(camera, 'x', { duration: 1.4, ease: 'power3.out' });
          const moveY = gsap.quickTo(camera, 'y', { duration: 1.4, ease: 'power3.out' });
          const lightX = gsap.quickTo(light, 'x', { duration: 1.8, ease: 'power3.out' });
          const lightY = gsap.quickTo(light, 'y', { duration: 1.8, ease: 'power3.out' });
          const move = (event: PointerEvent) => {
            const bounds = element.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            moveX(x * -22);
            moveY(y * -16);
            lightX(x * 100);
            lightY(y * 60);
          };
          const reset = () => {
            moveX(0);
            moveY(0);
            lightX(0);
            lightY(0);
          };
          element.addEventListener('pointermove', move);
          element.addEventListener('pointerleave', reset);
          return () => {
            element.removeEventListener('pointermove', move);
            element.removeEventListener('pointerleave', reset);
          };
        },
      );
    });
    return () => {
      cancelled = true;
      media.revert();
    };
  }, []);

  return (
    <div ref={track} className="hero-scroll-track">
      <section ref={section} id="hero" className="architecture-hero" aria-labelledby="hero-heading">
        <div className="hero-media">
          <div className="hero-camera">
            <div className="hero-image" data-hero-image>
              <div className="hero-stage hero-stage-foundation">
                <NextImage
                  src="/images/generated/courtyard-foundation.webp"
                  alt=""
                  fill
                  priority
                  sizes={imageSizes}
                  quality={88}
                />
              </div>
              <div className="hero-stage hero-stage-structure">
                <NextImage
                  src="/images/generated/courtyard-structure.webp"
                  alt=""
                  fill
                  loading="eager"
                  sizes={imageSizes}
                  quality={88}
                />
              </div>
              <div className="hero-stage hero-stage-shell">
                <NextImage
                  src="/images/generated/courtyard-before.webp"
                  alt=""
                  fill
                  loading="eager"
                  sizes={imageSizes}
                  quality={88}
                />
              </div>
              <div className="hero-stage hero-stage-complete">
                <NextImage
                  src="/images/generated/courtyard-residence.webp"
                  alt="A modern Nigerian courtyard residence progressing from its foundations to a completed, landscaped home"
                  fill
                  loading="eager"
                  sizes={imageSizes}
                  quality={90}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="hero-build-scan" aria-hidden="true" />
        <div className="hero-atmosphere" aria-hidden="true" />
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
          .hero-stage-structure, .hero-stage-shell, .hero-stage-complete { clip-path: inset(0) !important; }
          .hero-scroll-track [data-hero-line] { transform: none; opacity: 1; }
          .hero-scroll-track .hero-overline, .hero-scroll-track .hero-bottom-row { opacity: 1; visibility: visible; }
        `}</style>
        </noscript>
      </section>
    </div>
  );
}
