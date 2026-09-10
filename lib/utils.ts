import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { breakpoints } from '@/config/branding';
import { siteUrl } from '@/config/site';

/**
 * Merge Tailwind classes safely. `clsx` handles conditionals, `twMerge` makes
 * later utilities win over earlier ones so component props can override
 * defaults without `!important`.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** "1200" -> "1,200". Uses en-NG so grouping matches the rest of the site. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-NG').format(value);
}

/** Naira with no decimals — construction budgets never need kobo. */
export function formatCurrency(value: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(input: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...opts,
  }).format(date);
}

/** Zero-pads a 1-based index for editorial numbering: 3 -> "03". */
export function padIndex(index: number, length = 2): string {
  return String(index).padStart(length, '0');
}

/**
 * Truncate on a word boundary and append an ellipsis. Used for card excerpts
 * where CSS line-clamp cannot be relied on (OG images, meta descriptions).
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}…`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Turns "3 items" into "3 items" and "1 items" into "1 item". */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------

export function debounce<T extends (...args: never[]) => void>(fn: T, wait = 200) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

/**
 * Trailing-edge-free throttle. Used on scroll and resize handlers where the
 * last call genuinely does not matter and an extra frame of work does.
 */
export function throttle<T extends (...args: never[]) => void>(fn: T, limit = 100) {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (inThrottle) return;
    fn(...args);
    inThrottle = true;
    setTimeout(() => {
      inThrottle = false;
    }, limit);
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Math
// ---------------------------------------------------------------------------

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const lerp = (start: number, end: number, t: number): number => start + (end - start) * t;

/** Remap a value from one range to another, clamped to the output range. */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (inMax === inMin) return outMin;
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

// ---------------------------------------------------------------------------
// Environment probes (all safe during SSR)
// ---------------------------------------------------------------------------

export const isBrowser = (): boolean => typeof window !== 'undefined';

export function prefersReducedMotion(): boolean {
  if (!isBrowser()) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isTouchDevice(): boolean {
  if (!isBrowser()) return false;
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

export function isBelow(bp: keyof typeof breakpoints): boolean {
  if (!isBrowser()) return false;
  return window.innerWidth < breakpoints[bp];
}

/**
 * Rough proxy for "this device will struggle with a shader-heavy hero".
 * Device memory and core count are unreliable individually but useful together.
 */
export function isLowPoweredDevice(): boolean {
  if (!isBrowser()) return false;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData) return true;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) return true;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) return true;
  return false;
}

// ---------------------------------------------------------------------------
// URLs
// ---------------------------------------------------------------------------

export function absoluteUrl(path = ''): string {
  if (!path) return siteUrl;
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function isExternalLink(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
}

/** Build a querystring, dropping empty values so URLs stay clean. */
export function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

/** Split a string into characters while keeping emoji and accents intact. */
export function splitGraphemes(text: string): string[] {
  return Array.from(text);
}

/** Type guard used when narrowing `unknown` errors in catch blocks. */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function getErrorMessage(error: unknown): string {
  if (isError(error)) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred.';
}
