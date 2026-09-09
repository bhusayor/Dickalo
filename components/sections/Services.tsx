'use client';

import NextImage from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { FadeInScroll } from '@/components/animations/FadeInScroll';
import { useSmoothScroll } from '@/components/layout/SmoothScrollProvider';
import type { Service } from '@/lib/types';

export interface ServicesProps {
  services: Service[];
  variant?: 'compact' | 'full';
  showHeading?: boolean;
}

export function Services({ services, variant = 'compact', showHeading = true }: ServicesProps) {
  const { scrollTo } = useSmoothScroll();
  const [active, setActive] = useState<string | null>(services[0]?._id ?? null);
  useEffect(() => {
    let settleTimer = 0;
    const openHash = () => {
      const service = services.find((item) => `#${item.slug}` === window.location.hash);
      if (service) {
        setActive(service._id);
        window.clearTimeout(settleTimer);
        // Opening this row can collapse a taller row above the anchor.
        settleTimer = window.setTimeout(() => scrollTo(`#${service.slug}`, -110, true), 500);
      }
    };
    openHash();
    window.addEventListener('hashchange', openHash);
    return () => {
      window.removeEventListener('hashchange', openHash);
      window.clearTimeout(settleTimer);
    };
  }, [services, scrollTo]);

  return (
    <section
      id="services"
      className={`section-space expertise-section ${variant === 'full' ? 'expertise-full' : ''}`}
    >
      <Container>
        {showHeading && (
          <FadeInScroll className="section-heading-row">
            <div>
              <p className="micro-label">
                <span className="label-dot" /> Our expertise / 02
              </p>
              <h2 className="editorial-heading">
                One vision.
                <br />
                Every <span className="display-accent">detail.</span>
              </h2>
            </div>
            <p className="section-heading-description">
              From a bold first idea to the final finishing touch. Everything your project needs,
              under one roof.
            </p>
          </FadeInScroll>
        )}
        <div className="expertise-layout">
          <FadeInScroll className="expertise-image">
            <NextImage
              src="/images/generated/sculptural-interior.webp"
              alt="Interior concept with a sculptural plaster staircase, timber screens and warm natural light"
              fill
              sizes="(max-width: 600px) 650px, (max-width: 900px) 100vw, 50vw"
            />
            <div className="image-caption">
              <span>Form. Material. Feeling.</span>
              <span>Design study / 02</span>
            </div>
          </FadeInScroll>
          <div className="service-accordion">
            {services.map((service, index) => {
              const open = active === service._id;
              return (
                <div
                  key={service._id}
                  id={service.slug}
                  className={`service-item ${open ? 'is-open' : ''}`}
                >
                  <h3>
                    <button
                      type="button"
                      id={`${service.slug}-trigger`}
                      aria-expanded={open}
                      aria-controls={`${service.slug}-panel`}
                      onClick={() => setActive(open ? null : service._id)}
                    >
                      <span className="service-number">{String(index + 1).padStart(2, '0')}</span>
                      <span>{service.title}</span>
                      <span className="accordion-symbol" aria-hidden="true">
                        {open ? '−' : '+'}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`${service.slug}-panel`}
                    role="region"
                    aria-labelledby={`${service.slug}-trigger`}
                    className="accordion-panel"
                    aria-hidden={!open}
                  >
                    <div>
                      <div className="service-body">
                        <p>{service.summary}</p>
                        {service.deliverables?.length ? (
                          <ul>
                            {service.deliverables.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : null}
                        <Button
                          href="/contact"
                          size="sm"
                          iconRight={<span aria-hidden="true">↗</span>}
                        >
                          Discuss your project
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
