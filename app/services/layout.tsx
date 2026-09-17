import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { buildMetadata, pageMeta } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata(pageMeta.services);

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return children;
}
