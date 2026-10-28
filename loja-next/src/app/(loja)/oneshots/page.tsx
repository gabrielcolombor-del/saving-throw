import { KitPicker } from './KitPicker';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Kits de Aventura One Shot para RPG',
  description:
    'Aventuras One Shot prontas para jogar: história impressa, mapas e miniaturas em resina dos heróis e monstros. O kit completo para a sua próxima sessão de RPG.',
  path: '/oneshots',
  image: '/assets/imagens/one shots.jpg',
  imageAlt: 'Kit de Aventura One Shot com miniaturas',
});

export default function OneshotsPage() {
  return (
    <div className="font-sans">
      <section
        className="relative bg-cover text-white py-20 border-b border-zinc-800 overflow-hidden flex items-center justify-center"
        style={{ backgroundImage: "url('/assets/imagens/one shots.jpg')", backgroundPosition: 'center 70%' }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-title uppercase tracking-tight mb-6">Kits de Aventura</h1>
          <p className="text-[#EBE3CB]/80 text-lg mb-4 max-w-2xl mx-auto leading-relaxed">
            Módulos &quot;One Shot&quot; prontos para jogar. Incluem a história impressa, mapas e todas as miniaturas necessárias.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white text-black">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2">
              <img
                src="/assets/imagens/preco_herdeiro.png"
                className="w-full rounded-xl shadow-xl border border-zinc-200"
                alt="Capa da Aventura O Preço do Herdeiro"
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <span className="text-amber-600 font-bold uppercase tracking-widest text-xs mb-2">Aventura Completa</span>
              <h2 className="font-title text-4xl md:text-5xl mb-6">O Preço do Herdeiro</h2>
              <p className="text-zinc-600 mb-6">
                Uma trama sombria de traição e espionagem. Este kit inclui o folheto físico impresso da aventura contendo os
                mapas e a história completa, além das miniaturas em resina dos monstros/NPCs da campanha e dos heróis para o
                seu tabuleiro.
              </p>

              <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-200 mb-8 shadow-sm">
                <h3 className="font-bold uppercase tracking-wide mb-4 text-sm text-zinc-500">Conteúdo do Combo:</h3>
                <ul className="space-y-2 mb-6 text-zinc-700">
                  <li>✔️ 1x Livreto Físico da Aventura (Impresso)</li>
                  <li>✔️ 4x Miniaturas de Monstros &amp; NPCs da Aventura (3x Cultistas + 1x Boss)</li>
                  <li>✔️ 4x Miniaturas de Heróis (Padrão ou Customizados, conforme o Kit)</li>
                </ul>
                <KitPicker />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
