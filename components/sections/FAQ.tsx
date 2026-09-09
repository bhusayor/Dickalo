'use client';

import { useState } from 'react';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';

const questions = [
  {
    question: 'Can you handle both the design and construction?',
    answer:
      'Yes. Our architects, engineers, and construction team work together from the first brief through to handover. You can also appoint us for an individual service, including architectural design, interiors, or project management.',
  },
  {
    question: 'Do you work on projects outside Lagos?',
    answer:
      'Yes. With offices in Lagos, Abuja, and Port Harcourt, we work across Nigeria. Tell us where your site is and we will discuss the right team and approach for your location.',
  },
  {
    question: 'What should I have ready for our first conversation?',
    answer:
      'Start with your location, what you want to build, an approximate budget, and your preferred timeline. If you have a survey, existing drawings, or a few references, those help too. You do not need a finished brief — we can develop it together.',
  },
  {
    question: 'How do you establish the budget and timeline?',
    answer:
      'We begin with the site, your brief, and a feasibility review. You see the design direction alongside an initial cost range. As the drawings develop, we agree the scope, programme, and contract before construction begins.',
  },
  {
    question: 'Can you renovate an existing building?',
    answer:
      'Yes. We begin with a condition survey to understand the existing structure and services. We then develop a renovation or restoration plan that balances your goals with the building’s condition and your budget.',
  },
];
export function FAQ() {
  const [active, setActive] = useState<number | null>(0);
  return (
    <section className="section-space faq-section" aria-labelledby="faq-heading">
      <Container>
        <div className="faq-layout">
          <div>
            <p className="micro-label">
              <span className="label-dot" /> Before we begin
            </p>
            <h2 id="faq-heading" className="editorial-heading">
              Good questions.
              <br />
              <span className="display-accent">Clear answers.</span>
            </h2>
            <p className="faq-intro">
              Every great project starts with a conversation. Here are a few things you might be
              wondering.
            </p>
            <Button href="/contact" iconRight={<span aria-hidden="true">↗</span>}>
              Let’s talk
            </Button>
          </div>
          <div>
            {questions.map((item, index) => (
              <div className={`faq-item ${active === index ? 'is-open' : ''}`} key={item.question}>
                <h3>
                  <button
                    type="button"
                    id={`faq-trigger-${index}`}
                    aria-expanded={active === index}
                    aria-controls={`faq-panel-${index}`}
                    onClick={() => setActive(active === index ? null : index)}
                  >
                    {item.question}
                    <span className="accordion-symbol" aria-hidden="true">
                      {active === index ? '−' : '+'}
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${index}`}
                  className="accordion-panel"
                  aria-hidden={active !== index}
                >
                  <div>
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
