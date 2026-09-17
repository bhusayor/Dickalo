'use client';

import NextImage from 'next/image';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/common/Button';
import { ArrowUpRight } from '@/components/common/NavigationIcons';
import { gsap, registerGsap, ScrollTrigger } from '@/lib/animations/gsapAnimations';

const imageSizes = '100vw';
const sequenceRoot = '/images/hero-construction/v1';

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    registerGsap();
    const media = gsap.matchMedia();
    media.add(
      {
        reduced: '(prefers-reduced-motion: reduce)',
        motion: '(prefers-reduced-motion: no-preference)',
      },
      (mediaContext) => {
        if (mediaContext.conditions?.reduced) {
          if (track.current) track.current.dataset.scene = 'fallback';
          return;
        }
        let cancelled = false;
        let animation: gsap.Context | undefined;
        let model:
          | ReturnType<
              typeof import('@/lib/animations/constructionSequence').mountConstructionSequence
            >
          | undefined;
        if (track.current) track.current.dataset.scene = 'loading';
        import('@/lib/animations/constructionSequence')
          .then(async ({ mountConstructionSequence }) => {
            if (cancelled || !canvas.current) return;
            model = mountConstructionSequence(canvas.current);
            animation = gsap.context(() => {
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
              section.current?.setAttribute('data-hero-state', 'foundation');
              section.current?.setAttribute('data-hero-progress', '0');
              model?.render(0);
              // Blender renders one fixed-camera model. GSAP selects its exact
              // construction frame; text follows the same scroll timeline.
              story
                .fromTo(construction, { progress: 0 }, { progress: 1, duration: 1 }, 0)
                .fromTo(
                  '[data-hero-line]',
                  { y: 0, yPercent: 110, opacity: 0 },
                  {
                    y: 0,
                    yPercent: 0,
                    opacity: 1,
                    duration: 0.2,
                    stagger: 0.06,
                    ease: 'power2.out',
                  },
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
            await model.prepare();
            if (!cancelled && track.current) track.current.dataset.scene = 'ready';
          })
          .catch((error) => {
            if (cancelled) return;
            console.error('Hero construction sequence failed to initialize', error);
            animation?.revert();
            model?.dispose();
            if (track.current) track.current.dataset.scene = 'fallback';
            ScrollTrigger.refresh();
          });
        return () => {
          cancelled = true;
          animation?.revert();
          model?.dispose();
        };
      },
    );
    return () => media.revert();
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
          <div className="hero-construction-poster" aria-hidden="true">
            <NextImage
              src={`${sequenceRoot}/foundation.webp`}
              alt=""
              fill
              priority
              unoptimized
              sizes={imageSizes}
            />
          </div>
          <div className="hero-construction-fallback">
            <NextImage
              src={`${sequenceRoot}/finished.webp`}
              alt="Photorealistic concept of a contemporary Nigerian garden residence"
              fill
              unoptimized
              sizes={imageSizes}
            />
          </div>
          <canvas
            ref={canvas}
            className="hero-construction-canvas"
            role="img"
            aria-label="A photorealistic Nigerian garden-house concept assembling in place as you scroll, from foundation and concrete frame through walls, roof, glazing and finishing"
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
        <noscript>
          <style>{`
          .hero-scroll-track { height: auto !important; }
          .hero-construction-canvas { display: none !important; }
          .hero-construction-poster { display: none !important; }
          .hero-construction-fallback { display: block !important; }
          .hero-scroll-track [data-hero-line] { transform: none; opacity: 1; }
          .hero-scroll-track .hero-overline, .hero-scroll-track .hero-bottom-row { opacity: 1; visibility: visible; }
        `}</style>
        </noscript>
      </section>
    </div>
  );
}
