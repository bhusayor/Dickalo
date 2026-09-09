import createImageUrlBuilder from '@sanity/image-url';
import type { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { dataset, projectId } from './client';
import type { SanityImageAsset } from '@/lib/types';

/**
 * Sanity image URL helpers.
 *
 * Sanity's CDN does the resizing, so we never ship an oversized original.
 * `auto('format')` serves AVIF/WebP where the browser supports it.
 */

const builder = createImageUrlBuilder({ projectId: projectId || 'placeholder', dataset });

export function imageBuilder(source: SanityImageSource): ImageUrlBuilder {
  return builder.image(source);
}

export interface ImageUrlOptions {
  width?: number;
  height?: number;
  quality?: number;
  /** 'crop' respects the editor's hotspot; 'fit' letterboxes instead. */
  fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min';
  blur?: number;
}

/**
 * Build a URL for a Sanity image. Returns an empty string when the reference is
 * missing so callers can branch on falsiness rather than catch.
 */
export function urlForImage(
  source: SanityImageSource | undefined | null,
  options: ImageUrlOptions = {},
): string {
  if (!source) return '';

  const asset = source as Partial<SanityImageAsset>;
  if (asset.asset && !asset.asset._ref) return '';

  const { width, height, quality = 82, fit = 'crop', blur } = options;

  try {
    let url = builder.image(source).auto('format').quality(quality).fit(fit);
    // Honour the editor's chosen focal point when cropping.
    url = url.crop('focalpoint');
    if (width) url = url.width(Math.round(width));
    if (height) url = url.height(Math.round(height));
    if (blur) url = url.blur(blur);
    return url.url();
  } catch {
    return '';
  }
}

/**
 * Tiny blurred version used as a `next/image` placeholder while the real image
 * loads. Prefer the `lqip` returned by the GROQ projection when it is present —
 * it is a data URI and costs no extra request.
 */
export function urlForBlur(source: SanityImageSource | undefined | null): string {
  if (!source) return '';
  return urlForImage(source, { width: 24, quality: 20, blur: 12 });
}

/** `next/image` props derived from a Sanity image, alt text included. */
export function imageProps(
  source: SanityImageAsset | undefined | null,
  options: { width: number; height?: number; quality?: number } = { width: 1600 },
): { src: string; alt: string; blurDataURL?: string; placeholder: 'blur' | 'empty' } | null {
  if (!source?.asset?._ref) return null;

  const src = urlForImage(source, options);
  if (!src) return null;

  return {
    src,
    // An empty alt is correct for decorative images; a missing one is not.
    alt: source.alt ?? '',
    blurDataURL: source.lqip,
    placeholder: source.lqip ? 'blur' : 'empty',
  };
}

/** Aspect ratio from the projected dimensions, defaulting to 3:2. */
export function aspectRatio(source: SanityImageAsset | undefined | null, fallback = 1.5): number {
  return source?.dimensions?.aspectRatio ?? fallback;
}
