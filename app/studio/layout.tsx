import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'DICKALO Studio',
  robots: { index: false, follow: false },
};

/**
 * Studio layout.
 *
 * The Studio brings its own full-height layout and its own reset, so this
 * wrapper deliberately does nothing but keep the site chrome out of the way.
 */
export default function StudioLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
