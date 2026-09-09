import type { ReactNode } from 'react';

/**
 * Project detail layout.
 *
 * Deliberately thin. Metadata and structured data belong on the page itself,
 * where the project data is already loaded — putting them here would mean
 * fetching the same document twice.
 */
export default function ProjectDetailLayout({ children }: { children: ReactNode }) {
  return <article className="bg-surface-base">{children}</article>;
}
