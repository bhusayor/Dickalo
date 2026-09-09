'use client';

import Link from 'next/link';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type CardVariant = 'default' | 'bordered' | 'raised' | 'bare';

const VARIANTS: Record<CardVariant, string> = {
  default: 'bg-surface-raised hairline',
  bordered: 'bg-transparent hairline',
  raised: 'bg-surface-sunken shadow-lift',
  bare: 'bg-transparent',
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Makes the whole card a link. Adds the correct hover and focus treatment. */
  href?: string;
  /** Adds hover lift and a gold hairline. */
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const PADDING = {
  none: '',
  sm: 'p-5',
  md: 'p-6 md:p-8',
  lg: 'p-8 md:p-10 lg:p-12',
} as const;

/**
 * Generic surface.
 *
 * When `href` is set the whole card becomes one link rather than nesting
 * interactive elements, which keeps the tab order to a single stop per card.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', href, interactive, padding = 'md', className, children, ...props },
  ref,
) {
  const isInteractive = interactive ?? Boolean(href);

  const classes = cn(
    'group relative overflow-hidden rounded-md transition-all duration-400 ease-expo',
    VARIANTS[variant],
    PADDING[padding],
    // On white, the hover state is elevation plus a deep-gold hairline. The
    // brand gold at 28% alpha (the dark-theme value) is invisible here.
    isInteractive && [
      'hover:-translate-y-1 hover:shadow-lift-lg',
      'hover:shadow-[inset_0_0_0_1px_rgba(217,180,0,0.65),0_32px_80px_-28px_rgba(10,10,9,0.28)]',
      'focus-within:shadow-[inset_0_0_0_1px_rgba(217,180,0,0.65)]',
    ],
    className,
  );

  if (href) {
    return (
      <div ref={ref} className={classes} {...props}>
        {children}
        {/*
          Stretched link: the anchor covers the card so the entire surface is
          clickable, while the visible content stays selectable text.
        */}
        <Link href={href} className="absolute inset-0 z-10 rounded-md" tabIndex={0}>
          <span className="sr-only">Read more</span>
        </Link>
      </div>
    );
  }

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

/** Numbered label used on service and process cards. */
export function CardIndex({ children }: { children: ReactNode }) {
  return (
    <span className="numeric font-display text-caption tabular-nums text-content-accent/70">{children}</span>
  );
}
