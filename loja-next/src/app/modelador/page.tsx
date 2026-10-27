import type { Metadata } from 'next';
import { Modelador } from '@/components/legacy/Modelador';

export const metadata: Metadata = {
  title: 'A Forja 3D | Saving Throw',
  description: 'Transforme uma imagem em modelo 3D.',
};

export default function Page() {
  return <Modelador />;
}
