'use client';

import { useState } from 'react';
import type { ServiceDetailFaq } from '@/lib/serviceDetails';

export function ServiceFaq({
  items,
  serviceTitle,
}: {
  items: ServiceDetailFaq[];
  serviceTitle: string;
}) {
  const [active, setActive] = useState<number | null>(0);

  return (
    <div className="service-detail-faq-list">
      {items.map((item, index) => {
        const open = active === index;
        const id = `service-faq-${index}`;

        return (
          <div key={item.question} className={open ? 'is-open' : undefined}>
            <h3>
              <button
                type="button"
                id={`${id}-trigger`}
                aria-expanded={open}
                aria-controls={`${id}-panel`}
                onClick={() => setActive(open ? null : index)}
              >
                <span>{item.question}</span>
                <span className="service-detail-faq-symbol" aria-hidden="true">
                  {open ? '−' : '+'}
                </span>
              </button>
            </h3>
            <div
              id={`${id}-panel`}
              role="region"
              aria-labelledby={`${id}-trigger`}
              aria-label={`${serviceTitle} answer`}
              aria-hidden={!open}
              className="service-detail-faq-panel"
            >
              <div>
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
