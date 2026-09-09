'use client';

import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn, isExternalLink } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link' | 'gold-outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

/** All action variants share one accessible brand fill and text pair. */
const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'brand-button',
  secondary: 'brand-button',
  ghost: 'brand-button',
  'gold-outline': 'brand-button',
  link: 'brand-button',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-body-sm gap-2',
  md: 'h-12 px-6 text-body-md gap-2.5',
  // 56px tall: comfortably above the 44px minimum touch target.
  lg: 'h-14 px-8 text-body-lg gap-3',
};

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Route or URL. Renders <Link> internally, <a> for external. */
  href?: string;
  loading?: boolean;
  /** Fill the parent's width. Use on mobile form buttons. */
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children: ReactNode;
  className?: string;
}

export type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>;

/** Three-dot indicator. Communicates "working" without a spinner's urgency. */
function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1 w-1 rounded-full bg-current"
          style={{ animation: `dk-dot-bounce 1.2s ${i * 0.15}s infinite ease-in-out` }}
        />
      ))}
    </span>
  );
}

/**
 * Button and link, one component.
 *
 * Renders whichever element is semantically correct — a `<button>` when it does
 * something, an `<a>` when it goes somewhere — so keyboard and screen-reader
 * behaviour is right without any ARIA patching.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    href,
    loading = false,
    fullWidth = false,
    iconLeft,
    iconRight,
    disabled,
    className,
    children,
    ...props
  },
  ref,
) {
  const classes = cn(
    'group relative inline-flex items-center justify-center',
    'transition-all duration-fast ease-expo',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-content-primary',
    'disabled:pointer-events-none disabled:opacity-45',
    // Nothing translates on hover for `link`, which sits inline in text.
    variant !== 'link' && 'sheen-target active:translate-y-0 hocus:-translate-y-0.5',
    // On white, elevation does the work that a glow did on black.
    variant === 'secondary' && 'hocus:shadow-lift',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  );

  const content = (
    <>
      {iconLeft && !loading ? (
        <span className="shrink-0 transition-transform duration-fast ease-expo group-hover:-translate-x-0.5">
          {iconLeft}
        </span>
      ) : null}

      {loading ? (
        <>
          <LoadingDots />
          {/* Announce the state change without visually duplicating it. */}
          <span className="sr-only" role="status">
            Working on it
          </span>
        </>
      ) : null}

      <span className={cn(loading && 'opacity-70')}>{children}</span>

      {iconRight && !loading ? (
        <span className="shrink-0 transition-transform duration-fast ease-expo group-hover:translate-x-0.5">
          {iconRight}
        </span>
      ) : null}
    </>
  );

  if (href && !disabled && !loading) {
    if (isExternalLink(href)) {
      const isHttp = href.startsWith('http');
      return (
        <a
          href={href}
          className={classes}
          {...(isHttp ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {content}
          {isHttp ? <span className="sr-only"> (opens in a new tab)</span> : null}
        </a>
      );
    }

    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </button>
  );
});

/**
 * Arrow used on most calls to action. Inline SVG rather than an icon library —
 * it is 200 bytes and needs no runtime.
 */
export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 8h11M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}
