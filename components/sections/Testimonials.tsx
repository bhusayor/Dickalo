'use client';

import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';
import { Image } from '@/components/common/Image';
import type { Testimonial } from '@/lib/types';

export interface TestimonialsProps {
  testimonials: Testimonial[];
}
const portraits = [
  '/images/portraits/portrait-1.webp',
  '/images/portraits/portrait-2.webp',
  '/images/portraits/portrait-3.webp',
  '/images/portraits/portrait-4.webp',
  '/images/portraits/portrait-5.webp',
];

export function Testimonials({ testimonials }: TestimonialsProps) {
  const section = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();
  const isInView = useInView(section, { amount: 0.2 });
  const activeIndex = testimonials.length ? index % testimonials.length : 0;

  useEffect(() => {
    if (reduce || !isInView || testimonials.length < 2) return;

    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % testimonials.length);
    }, 10_000);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isInView, reduce, testimonials.length]);

  if (!testimonials.length) return null;
  const active = testimonials[activeIndex];
  const isIllustrative = !active.image?.asset?._ref;
  const goTo = (next: number) => setIndex((next + testimonials.length) % testimonials.length);

  return (
    <section
      ref={section}
      id="testimonials"
      className="section-space client-section"
      aria-labelledby="client-heading"
    >
      <Container>
        <div className="section-heading-row client-heading-row">
          <div>
            <p className="micro-label">
              <span className="label-dot" /> The people behind the projects
            </p>
            <h2 id="client-heading" className="editorial-heading">
              Spaces make an impression.
              <br />
              Relationships make it last.
            </h2>
          </div>
          <div className="client-heading-note">
            <span className="client-heading-line" />
            <p>
              Good work is personal.
              <br />
              So are the stories that follow.
            </p>
          </div>
        </div>
        <div className="client-story">
          <div className="client-portrait-frame">
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                className="client-portrait-image"
                key={active._id}
                initial={reduce ? false : { opacity: 0, scale: 1.035 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.65 }}
              >
                <Image
                  source={active.image}
                  src={portraits[activeIndex % portraits.length]}
                  alt={isIllustrative ? 'Illustrative stock portrait' : active.author}
                  fill
                  ratio="auto"
                  sizes="(max-width: 600px) 100vw, 450px"
                  wrapperClassName="h-full w-full"
                />
              </motion.div>
            </AnimatePresence>
            <div className="client-portrait-caption">
              <span>{isIllustrative ? 'Illustrative portrait' : active.author}</span>
              <span aria-hidden="true">
                0{activeIndex + 1} / 0{testimonials.length}
              </span>
            </div>
          </div>
          <div className="client-story-body">
            <span className="client-quote-symbol" aria-hidden="true">
              “
            </span>
            <div
              className="client-quote-area"
              role="tabpanel"
              id="client-story-panel"
              aria-labelledby={`client-person-${activeIndex}`}
              tabIndex={0}
              aria-live="polite"
              aria-atomic="true"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.figure
                  key={active._id}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduce ? 0 : -12 }}
                  transition={{ duration: reduce ? 0 : 0.3 }}
                >
                  <blockquote>{active.quote}</blockquote>
                  <figcaption>
                    <span className="client-name-rule" />
                    <span>
                      <strong>{active.author}</strong>
                      <small>
                        {active.role}
                        {active.company ? ` · ${active.company}` : ''}
                      </small>
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
            <div className="client-story-controls">
              <div
                className="client-portrait-tabs"
                role="tablist"
                aria-label="Choose a client story"
                onKeyDown={(event) => {
                  let next = activeIndex;
                  if (event.key === 'ArrowRight') next = (activeIndex + 1) % testimonials.length;
                  else if (event.key === 'ArrowLeft')
                    next = (activeIndex - 1 + testimonials.length) % testimonials.length;
                  else if (event.key === 'Home') next = 0;
                  else if (event.key === 'End') next = testimonials.length - 1;
                  else return;
                  event.preventDefault();
                  goTo(next);
                  tabs.current[next]?.focus();
                }}
              >
                {testimonials.map((item, i) => (
                  <button
                    key={item._id}
                    ref={(node) => {
                      tabs.current[i] = node;
                    }}
                    type="button"
                    role="tab"
                    id={`client-person-${i}`}
                    aria-controls="client-story-panel"
                    aria-selected={activeIndex === i}
                    aria-label={`Read ${item.author}'s story`}
                    tabIndex={activeIndex === i ? 0 : -1}
                    onClick={() => goTo(i)}
                  >
                    <svg className="client-avatar-progress" viewBox="0 0 52 52" aria-hidden="true">
                      <circle className="client-avatar-progress-track" cx="26" cy="26" r="24" />
                      {activeIndex === i && (isInView || reduce) && (
                        <circle
                          className={
                            reduce
                              ? 'client-avatar-progress-complete'
                              : 'client-avatar-progress-ring'
                          }
                          cx="26"
                          cy="26"
                          r="24"
                        />
                      )}
                    </svg>
                    <Image
                      source={item.image}
                      src={portraits[i % portraits.length]}
                      alt=""
                      ratio="square"
                      sizes="64px"
                      wrapperClassName="h-full w-full rounded-full"
                    />
                  </button>
                ))}
              </div>
              <div className="client-arrow-controls">
                <Button
                  type="button"
                  size="sm"
                  aria-label="Previous testimonial"
                  disabled={testimonials.length < 2}
                  onClick={() => goTo(activeIndex - 1)}
                >
                  ←
                </Button>
                <Button
                  type="button"
                  size="sm"
                  aria-label="Next testimonial"
                  disabled={testimonials.length < 2}
                  onClick={() => goTo(activeIndex + 1)}
                >
                  →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
