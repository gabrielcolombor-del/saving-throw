import type { Metadata } from 'next';
import { InstrucoesMesa } from '@/components/legacy/InstrucoesMesa';

export const metadata: Metadata = {
  title: 'Instruções da Mesa de Som | Saving Throw',
  description: 'Como usar a mesa de efeitos sonoros do Saving Throw.',
};

export default function Page() {
  return <InstrucoesMesa />;
}
