import { Habilidades } from '@/components/legacy/Habilidades';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Habilidades & Feitiços',
  description: 'Consulte habilidades e feitiços do Sistema Saving Throw por classe e ciclo: efeitos, alcance e descrição completa para montar a ficha do seu personagem.',
  path: '/habilidades',
});

export default function Page() {
  return <Habilidades />;
}
