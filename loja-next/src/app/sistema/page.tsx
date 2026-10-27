import type { Metadata } from 'next';
import { Sistema } from '@/components/legacy/Sistema';

export const metadata: Metadata = {
  title: 'Sistema ST | Saving Throw',
  description: 'Aprenda a jogar o Sistema Saving Throw com videoaulas e o manual simplificado.',
};

export default function Page() {
  return <Sistema />;
}
