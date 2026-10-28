import Script from 'next/script';
import { Modelador } from '@/components/legacy/Modelador';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'A Forja 3D: Imagem em Modelo 3D',
  description: 'Transforme a imagem do seu personagem em um modelo 3D e veja como ele pode virar uma miniatura de RPG em resina.',
  path: '/modelador',
});

export default function Page() {
  return (
    <>
      <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js" strategy="lazyOnload" />
      <Modelador />
    </>
  );
}
