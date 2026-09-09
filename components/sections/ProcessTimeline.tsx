'use client';

import { useRef, useState } from 'react';
import { Container } from '@/components/common/Container';
import { FadeInScroll } from '@/components/animations/FadeInScroll';
import { PROCESS_STEPS } from '@/lib/constants';

export function ProcessTimeline() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = PROCESS_STEPS[active];
  return (
    <section id="process" className="section-space process-section">
      <Container>
        <FadeInScroll className="section-heading-row">
          <div>
            <p className="micro-label">
              <span className="label-dot" /> Our approach / 03
            </p>
            <h2 className="editorial-heading">
              A clear path.
              <br />
              An extraordinary <span className="display-accent">outcome.</span>
            </h2>
          </div>
          <p className="section-heading-description">
            Good buildings don’t happen by chance. Our process keeps your vision, budget, and
            timeline in focus at every step.
          </p>
        </FadeInScroll>
        <div
          className="process-tabs"
          role="tablist"
          aria-label="Project stages"
          onKeyDown={(event) => {
            let next = active;
            if (event.key === 'ArrowRight') next = (active + 1) % PROCESS_STEPS.length;
            else if (event.key === 'ArrowLeft')
              next = (active - 1 + PROCESS_STEPS.length) % PROCESS_STEPS.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = PROCESS_STEPS.length - 1;
            else return;
            event.preventDefault();
            setActive(next);
            tabs.current[next]?.focus();
          }}
        >
          {PROCESS_STEPS.map((step, index) => (
            <button
              key={step.id}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              type="button"
              id={`stage-tab-${step.id}`}
              role="tab"
              aria-selected={active === index}
              aria-controls={`stage-panel-${step.id}`}
              tabIndex={active === index ? 0 : -1}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') setActive(index);
              }}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
            >
              <span>{step.number}</span>
              <span>{step.title}</span>
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        {PROCESS_STEPS.map((step, index) => (
          <div
            key={step.id}
            role="tabpanel"
            id={`stage-panel-${step.id}`}
            aria-labelledby={`stage-tab-${step.id}`}
            hidden={active !== index}
            tabIndex={0}
          >
            {active === index && (
              <div className="process-panel">
                <span className="process-big-number" aria-hidden="true">
                  {current.number}
                </span>
                <div>
                  <p className="micro-label">Stage {current.number} / Your vision, taking shape</p>
                  <h3>{current.title}</h3>
                  <p>{current.description}</p>
                </div>
                <div className="process-deliverable">
                  <span className="micro-label">What you walk away with</span>
                  <p>
                    <span aria-hidden="true">↗</span>
                    {current.deliverable}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </Container>
    </section>
  );
}
