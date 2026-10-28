import Script from 'next/script';
import { Sons } from '@/components/legacy/Sons';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Efeitos Sonoros para RPG',
  description: 'Mesa de som gratuita para mestres de RPG: ambientes, efeitos sonoros e trilhas para tavernas, masmorras, combates e cenas épicas.',
  path: '/sons',
});

export default function Page() {
  return (
    <>
      <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
      <Sons />
    </>
  );
}
