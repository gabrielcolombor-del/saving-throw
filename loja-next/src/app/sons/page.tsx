import type { Metadata } from 'next';
import { Sons } from '@/components/legacy/Sons';

export const metadata: Metadata = {
  title: 'Efeitos Sonoros | Saving Throw',
  description: 'Mesa de som para mestres de RPG: ambientes, efeitos e cenas para suas sessões.',
};

export default function Page() {
  return <Sons />;
}
