'use client';

import { useId, useMemo } from 'react';
import { Image } from '@/components/common/Image';
import type { SanityImageAsset } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Client avatar.
 *
 * Uses a real photograph when the CMS has one. When it does not, it draws a
 * deterministic abstract mark instead of falling back to a grey silhouette or a
 * stock face.
 *
 * WHY ABSTRACT AND NOT STOCK PHOTOGRAPHY
 * The fallback testimonials are placeholder copy. Attaching photographs of real
 * people to invented quotes at a named company manufactures evidence — it
 * would look like proof while being fiction. An abstract mark is honest: it
 * clearly stands in for a person without pretending to be one.
 *
 * The mark is derived from the name, so the same client always gets the same
 * avatar across renders and across pages, and no two names in a row collide.
 */

/**
 * FNV-1a. Small, fast, and well distributed for short strings — which matters
 * because a weak hash would give adjacent names the same colour.
 */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Palette pairs drawn from the brand ramp. Every combination keeps the initials
 * above 4.5:1 against its own background, so the mark stays readable at 40px.
 */
const PALETTES: { from: string; to: string; ink: string }[] = [
  { from: '#FFD700', to: '#D9B400', ink: '#0A0A09' },
  { from: '#0A0A09', to: '#33332F', ink: '#FFD700' },
  { from: '#F2F2EE', to: '#C9C9C2', ink: '#0A0A09' },
  { from: '#7A6600', to: '#4A3E00', ink: '#FFF8D6' },
  { from: '#4A4A45', to: '#1F1F1C', ink: '#FFEFA3' },
  { from: '#FFEFA3', to: '#FFD700', ink: '#0A0A09' },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0] ?? '').slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
}

export interface AvatarProps {
  name: string;
  /** Real photograph from the CMS. Takes priority over the generated mark. */
  source?: SanityImageAsset | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'h-10 w-10 text-[0.6875rem]',
  md: 'h-14 w-14 text-caption',
  lg: 'h-20 w-20 text-body-md',
} as const;

const PX = { sm: 40, md: 56, lg: 80 } as const;

export function Avatar({ name, source, size = 'md', className }: AvatarProps) {
  /**
   * A client can appear more than once on a page — in the quote and again in
   * the selector — so the gradient id has to be unique per instance, not per
   * name. Duplicate SVG ids are invalid HTML and make the second element
   * silently reference the first element's gradient.
   */
  const instanceId = useId().replace(/[^a-zA-Z0-9]/g, '');

  const { palette, angle, seed } = useMemo(() => {
    const h = hash(name);
    return {
      palette: PALETTES[h % PALETTES.length] ?? PALETTES[0]!,
      // Rotating the gradient gives visibly different marks even when two
      // names land on the same palette.
      angle: (h >> 8) % 360,
      seed: h,
    };
  }, [name]);

  if (source?.asset?._ref) {
    return (
      <Image
        source={source}
        alt=""
        ratio="square"
        cdnWidth={PX[size] * 2}
        sizes={`${PX[size]}px`}
        wrapperClassName={cn('shrink-0 rounded-full', SIZES[size], className)}
      />
    );
  }

  const gradientId = `av-${seed.toString(36)}-${instanceId}`;
  // Two arcs at hashed offsets, so the mark has some structure beyond a blob.
  const arcOffset = 12 + (seed % 18);

  return (
    <span
      className={cn(
        'relative grid shrink-0 place-items-center overflow-hidden rounded-full',
        SIZES[size],
        className,
      )}
      // Decorative: the client's name is always rendered as text beside this.
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={gradientId} gradientTransform={`rotate(${angle} 0.5 0.5)`}>
            <stop offset="0%" stopColor={palette.from} />
            <stop offset="100%" stopColor={palette.to} />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#${gradientId})`} />
        {/* Faint architectural arcs — a nod to a setting-out drawing. */}
        <circle
          cx={50 - arcOffset}
          cy={50 + arcOffset}
          r="46"
          fill="none"
          stroke={palette.ink}
          strokeOpacity="0.16"
          strokeWidth="1.5"
        />
        <circle
          cx={50 + arcOffset}
          cy={50 - arcOffset}
          r="32"
          fill="none"
          stroke={palette.ink}
          strokeOpacity="0.12"
          strokeWidth="1.5"
        />
      </svg>

      <span className="relative font-display font-semibold" style={{ color: palette.ink }}>
        {initials(name)}
      </span>
    </span>
  );
}

/**
 * Overlapping avatar row, as used under the hero in the reference layout.
 * Purely decorative — the count beside it carries the information.
 */
export function AvatarStack({
  names,
  className,
}: {
  names: string[];
  className?: string;
}) {
  return (
    <div className={cn('flex items-center', className)}>
      {names.slice(0, 4).map((name, index) => (
        <Avatar
          key={name}
          name={name}
          size="sm"
          className={cn(
            'ring-2 ring-surface-base',
            index > 0 && '-ml-3',
          )}
        />
      ))}
    </div>
  );
}
