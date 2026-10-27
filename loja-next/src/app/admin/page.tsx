import type { Metadata } from 'next';
import Script from 'next/script';
import { Admin } from '@/components/legacy/Admin';

export const metadata: Metadata = {
  title: 'Painel Admin | Saving Throw',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js" strategy="afterInteractive" />
      <Admin />
    </>
  );
}
