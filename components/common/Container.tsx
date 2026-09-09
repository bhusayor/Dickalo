import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ContainerWidth = 'default' | 'narrow' | 'prose' | 'wide' | 'full';

const WIDTHS: Record<ContainerWidth, string> = {
  /** Site standard — 1440px with fluid gutters. */
  default: 'max-w-container',
  /** Feature content that should not run the full width. */
  narrow: 'max-w-5xl',
  /** Reading measure for long-form copy. */
  prose: 'max-w-prose',
  /** Edge-to-edge media with gutters preserved. */
  wide: 'max-w-[110rem]',
  /** No max width; gutters only. */
  full: 'max-w-none',
};

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  width?: ContainerWidth;
  /** Drop the horizontal padding — for sections that bleed to the edge. */
  bleed?: boolean;
  children: ReactNode;
}

/**
 * Layout container.
 *
 * Every section uses this so the left text edge is identical the whole way down
 * the page. Gutters are fluid (`clamp(1.25rem, 5vw, 4rem)`), so the margin
 * grows with the viewport rather than jumping at breakpoints.
 */
export const Container = forwardRef<HTMLElement, ContainerProps>(function Container(
  { as: Tag = 'div', width = 'default', bleed = false, className, children, ...props },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={cn('mx-auto w-full', WIDTHS[width], !bleed && 'px-gutter', className)}
      {...props}
    >
      {children}
    </Tag>
  );
});
