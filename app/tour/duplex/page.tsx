import type { Metadata } from 'next';
import { DuplexTour } from '@/components/tour/DuplexTour';

export const metadata: Metadata = {
  title: 'Duplex Virtual Tour',
  description:
    'Walk through a full two-storey residential BIM model and explore every room in an interactive DICKALO virtual-tour study.',
};

export default function DuplexTourPage() {
  return <DuplexTour />;
}
