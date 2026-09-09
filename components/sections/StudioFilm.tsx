'use client';

import { useEffect, useRef } from 'react';
import { gsap, registerGsap } from '@/lib/animations/gsapAnimations';

/** Decorative Nigerian construction footage; playback follows visibility and motion preferences. */
export function StudioFilm() {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const node = video.current;
    if (!node) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    const syncPlayback = () => {
      if (inView && !preference.matches && !document.hidden) node.play().catch(() => {});
      else node.pause();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    preference.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);
    registerGsap();
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.fromTo(
          '.film-title',
          { y: 40 },
          {
            y: -30,
            ease: 'none',
            scrollTrigger: {
              trigger: section.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
      }, section);
      return () => context.revert();
    });
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', syncPlayback);
      document.removeEventListener('visibilitychange', syncPlayback);
      media.revert();
    };
  }, []);

  return (
    <section ref={section} className="studio-film on-inverse" aria-labelledby="film-heading">
      <video
        ref={video}
        src="/videos/lagos-construction.mp4"
        poster="/images/lagos-construction-poster.jpg"
        muted
        playsInline
        loop
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="film-scrim" />
      <div className="film-top">
        <span className="micro-label">From the drawing board. To the real world.</span>
        <span className="micro-label">The craft of construction</span>
      </div>
      <div className="film-title">
        <p className="micro-label">Vision is only the beginning.</p>
        <h2 id="film-heading">
          This is where
          <br />
          it becomes real.
        </h2>
        <span className="film-location">
          <span className="status-dot" /> Akoka, Yaba. Lagos, Nigeria.
        </span>
      </div>
      <div className="film-bottom">
        <span>Precision in every stage. Pride in every detail.</span>
        <a
          href="https://www.pexels.com/video/construction-akoka-yaba-lagos-nigeria-27531033/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Lagos construction study · Film by Vitalis Nwenyi
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </section>
  );
}
