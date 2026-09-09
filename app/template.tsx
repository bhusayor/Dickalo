import type { ReactNode } from 'react';

/** CSS keeps the server and first client render identical for every motion preference. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
