'use client';

import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { cn, formatNumber } from '@/lib/utils';

export interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Seconds. Above ~2.5 people stop watching. */
  duration?: number;
  decimals?: number;
  className?: string;
}

/**
 * Number counter.
 *
 * Written with requestAnimationFrame rather than a library so the whole thing
 * is ~40 lines and adds nothing to the bundle. Eases out cubically, which makes
 * the final value feel arrived-at rather than cut off.
 *
 * Accessibility: the animated digits are hidden from assistive technology and
 * the final value is exposed once, so a screen reader announces "120" and not
 * a stream of intermediate numbers.
 */
export function CountUp({
  value,
  prefix = '',
  suffix = '',
  duration = 2,
  decimals = 0,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    if (reduce) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const durationMs = duration * 1000;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplay(value * eased);

      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value, duration, reduce]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : formatNumber(Math.round(display));

  return (
    <span ref={ref} className={cn('numeric', className)}>
      <span aria-hidden="true">
        {prefix}
        {formatted}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {decimals > 0 ? value.toFixed(decimals) : formatNumber(value)}
        {suffix}
      </span>
    </span>
  );
}

export interface CountUpStatProps {
  value: number;
  label: string;
  note?: string;
  prefix?: string;
  suffix?: string;
  /** Set when the stat sits on the near-black band. */
  inverse?: boolean;
  className?: string;
}

/**
 * One statistic: the number, what it counts, and an honest qualifier.
 *
 * The `inverse` flag exists because gold is the one colour that cannot simply
 * be reused across both grounds. On black it is the brand at 14.1:1; on white
 * the same hex is 1.4:1 and has to be swapped for the darkened `content-accent`.
 */
export function CountUpStat({
  value,
  label,
  note,
  prefix,
  suffix,
  inverse = false,
  className,
}: CountUpStatProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 border-t pt-6',
        inverse ? 'border-line-inverse' : 'border-line',
        className,
      )}
    >
      <CountUp
        value={value}
        prefix={prefix}
        suffix={suffix}
        className={cn(
          'font-display text-display-md leading-none',
          inverse ? 'text-gold' : 'text-content-accent',
        )}
      />
      <p
        className={cn(
          'text-body-md font-medium',
          inverse ? 'text-content-inverse' : 'text-content-primary',
        )}
      >
        {label}
      </p>
      {note ? (
        <p className={cn('text-caption', inverse ? 'text-ink-400' : 'text-content-muted')}>
          {note}
        </p>
      ) : null}
    </div>
  );
}
