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
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
            onUpdate: () => {
              const progress = story.progress();
              section.current?.setAttribute('data-hero-progress', progress.toFixed(3));
              section.current?.setAttribute(
                'data-hero-state',
                progress < 0.02 ? 'potential' : progress < 0.9 ? 'transforming' : 'alive',
              );
            },
          });
          reveal.current = story;
          section.current?.setAttribute('data-hero-state', 'potential');
          section.current?.setAttribute('data-hero-progress', '0');
          story
            .fromTo('[data-hero-image]', { scale: 1.075 }, { scale: 1, duration: 1 }, 0)
            .fromTo(
              '.hero-after',
              { '--reveal': '100%' },
              { '--reveal': '0%', duration: 0.78, ease: 'power1.inOut' },
              0.06,
            )
            .fromTo('.hero-atmosphere', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.2)
            .fromTo(
              '[data-hero-line]',
              { y: 0, yPercent: 110, opacity: 0 },
              { y: 0, yPercent: 0, opacity: 1, duration: 0.38, stagger: 0.12, ease: 'power2.out' },
              0.1,
            )
            .fromTo(
              '.hero-overline',
              { y: 18, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.25 },
              0.15,
            )
            .fromTo(
              '.hero-bottom-row',
              { y: 24, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.28 },
              0.42,
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
              <div className="hero-before">
                <NextImage
                  src="/images/generated/courtyard-before.webp"
                  alt=""
                  fill
                  priority
                  sizes={imageSizes}
                  quality={88}
                />
              </div>
              <div className="hero-after">
                <NextImage
                  src="/images/generated/courtyard-residence.webp"
                  alt="Architectural concept transforming a desolate courtyard house into a warm, landscaped residence"
                  fill
                  priority
                  sizes={imageSizes}
                  quality={90}
                />
              </div>
            </div>
          </div>
        </div>
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
            <span aria-hidden="true">↓</span> Scroll to bring it to life
          </button>
        </div>
        <noscript>
          <style>{`
          .hero-scroll-track { height: auto !important; }
          .hero-after { --reveal: 0%; }
          .hero-scroll-track [data-hero-line] { transform: none; opacity: 1; }
          .hero-scroll-track .hero-overline, .hero-scroll-track .hero-bottom-row { opacity: 1; visibility: visible; }
        `}</style>
        </noscript>
      </section>
    </div>
  );
}
