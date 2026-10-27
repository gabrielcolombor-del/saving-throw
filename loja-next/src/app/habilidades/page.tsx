import type { Metadata } from 'next';
import { Habilidades } from '@/components/legacy/Habilidades';

export const metadata: Metadata = {
  title: 'Habilidades & Feitiços | Saving Throw',
  description: 'Consulte habilidades e feitiços por classe e ciclo para o sistema Saving Throw.',
};

export default function Page() {
  return <Habilidades />;
}
