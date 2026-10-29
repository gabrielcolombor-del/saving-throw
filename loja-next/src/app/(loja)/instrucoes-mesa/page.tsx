import { InstrucoesMesa } from '@/components/legacy/InstrucoesMesa';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Como Usar a Mesa de Som',
  description: 'Passo a passo para usar a mesa de efeitos sonoros do Saving Throw: crie ambientes, organize cenas e controle a trilha da sua sessão de RPG.',
  path: '/instrucoes-mesa',
});

export default function Page() {
  return <InstrucoesMesa />;
}
