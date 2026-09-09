import { Container } from '@/components/common/Container';
import { CountUpStat } from '@/components/animations/CountUpStats';
import { FadeInScroll } from '@/components/animations/FadeInScroll';
import { STATS } from '@/lib/constants';
import type { StatItem } from '@/lib/types';

export interface StatsProps {
  stats?: StatItem[];
}
export function Stats({ stats = STATS }: StatsProps) {
  return (
    <section id="stats" className="numbers-section on-inverse" aria-labelledby="stats-heading">
      <Container>
        <FadeInScroll className="numbers-heading">
          <p className="micro-label">
            <span className="label-dot" /> A foundation of experience
          </p>
          <h2 id="stats-heading">
            Our work speaks.
            <br />
            The numbers <span className="display-accent">stand behind it.</span>
          </h2>
        </FadeInScroll>
        <div className="numbers-grid">
          {stats.map((stat, index) => (
            <FadeInScroll key={stat.label} delay={index * 0.08}>
              <CountUpStat {...stat} inverse />
            </FadeInScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}
