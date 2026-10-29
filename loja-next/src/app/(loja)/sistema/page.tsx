import Script from 'next/script';
import { Sistema } from '@/components/legacy/Sistema';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Sistema ST: Aprenda a Jogar RPG',
  description: 'Aprenda a jogar o Sistema Saving Throw com videoaulas e o manual simplificado: regras, testes e criação de personagem para começar sua primeira mesa de RPG.',
  path: '/sistema',
});

export default function Page() {
  return (
    <>
      <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
      <Sistema />
    </>
  );
}
