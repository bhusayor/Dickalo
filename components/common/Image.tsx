'use client';

import { motion, useReducedMotion } from 'framer-motion';
import NextImage, { type ImageProps as NextImageProps } from 'next/image';
import { useState } from 'react';
import { urlForImage } from '@/lib/sanity/imageUrlBuilder';
import type { SanityImageAsset } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Image wrapper.
 *
 * Handles the three things every image on this site needs and `next/image`
 * does not do by itself:
 *  1. Accepts either a Sanity asset or a plain src.
 *  2. Uses Sanity's LQIP as the blur placeholder — no extra request.
 *  3. Degrades to a styled panel when the source is missing or fails, so a
 *     broken CMS reference never shows a torn-image icon.
 */

type Ratio = 'square' | '4/3' | '3/2' | '16/9' | '3/4' | '2/3' | 'auto';

const RATIOS: Record<Ratio, string> = {
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '3/2': 'aspect-[3/2]',
  '16/9': 'aspect-video',
  '3/4': 'aspect-[3/4]',
  '2/3': 'aspect-[2/3]',
  auto: '',
};

export interface ImageProps extends Omit<NextImageProps, 'src' | 'alt' | 'placeholder'> {
  /** A Sanity asset or a path under /public. */
  source?: SanityImageAsset | null;
  src?: string;
  alt: string;
  ratio?: Ratio;
  /** Width requested from Sanity's CDN. Ignored for local sources. */
  cdnWidth?: number;
  /** Adds the hover zoom used on cards. */
  zoom?: boolean;
  /**
   * Uncovers the image with a clip-path wipe when it scrolls into view.
   * Cheaper and smoother than animating the image itself: the frame never
   * moves, so nothing around it can reflow.
   */
  reveal?: boolean;
  className?: string;
  wrapperClassName?: string;
}

export function Image({
  source,
  src,
  alt,
  ratio = 'auto',
  cdnWidth = 1600,
  zoom = false,
  reveal = false,
  fill = true,
  sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw',
  quality = 82,
  priority,
  className,
  wrapperClassName,
  ...props
}: ImageProps) {
  const [failed, setFailed] = useState(false);
  const reduceMotion = useReducedMotion();

  // `quality` arrives as number | `${number}` from next/image's prop type.
  const resolvedSrc = source?.asset?._ref
    ? urlForImage(source, { width: cdnWidth, quality: Number(quality) })
    : src;
  const blurDataURL = source?.lqip;

  const wrapper = cn(
    'relative overflow-hidden bg-surface-sunken',
    RATIOS[ratio],
    zoom && 'zoom-frame',
    wrapperClassName,
  );

  // Missing or broken source: a quiet panel with the brand mark, not an error.
  if (!resolvedSrc || failed) {
    return (
      <div className={wrapper} role="img" aria-label={alt || 'Image unavailable'}>
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-ink-100 via-ink-50 to-ink-200">
          <span
            className="font-display text-[0.6rem] uppercase tracking-[0.35em] text-ink-400"
            aria-hidden="true"
          >
            DICKALO
          </span>
        </div>
      </div>
    );
  }

  // Reveal wraps the same markup in a motion element rather than duplicating it.
  const Frame = reveal && !reduceMotion ? motion.div : 'div';
  const frameProps =
    reveal && !reduceMotion
      ? {
          initial: { clipPath: 'inset(0 0 100% 0)' },
          whileInView: { clipPath: 'inset(0 0 0% 0)' },
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const },
        }
      : {};

  return (
    <Frame className={wrapper} {...frameProps}>
      <NextImage
        src={resolvedSrc}
        alt={alt}
        fill={fill}
        sizes={sizes}
        quality={quality}
        priority={priority}
        // `priority` images must not be lazy — Next warns if both are set.
        loading={priority ? undefined : 'lazy'}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        onError={() => setFailed(true)}
        className={cn('object-cover', className)}
        {...props}
      />
    </Frame>
  );
}
