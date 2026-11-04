import Link from 'next/link';
import { WHATSAPP_URL, pageMetadata } from '@/lib/site';

/*
 * Política de trocas e devoluções (exigida pelo Google Merchant Center).
 * Decisão do dono da loja: oferecer o mínimo legal, nem acima nem abaixo. Baseada no CDC (arts. 18, 26 e 49)
 * e no Decreto 7.962/2013 (art. 5º). Direitos do CDC não podem ser reduzidos (arts. 25 e 51), então não
 * encurte prazos nem condicione o reembolso. Ao mudar prazos aqui, atualize também o Merchant Center e o
 * JSON-LD em (loja)/layout.tsx.
 */

const UPDATED_AT = '4 de novembro de 2026';
const RETURN_WINDOW_DAYS = 7;

export const metadata = pageMetadata({
  title: 'Política de Trocas e Devoluções',
  description:
    'Como devolver ou trocar um produto da Saving Throw: 7 dias para desistir da compra, 90 dias para defeitos, frete de devolução por nossa conta e reembolso integral.',
  path: '/politica-de-devolucao',
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-title text-2xl md:text-3xl text-zinc-900">{title}</h2>
      <div className="space-y-3 text-sm md:text-base leading-relaxed text-zinc-700">{children}</div>
    </section>
  );
}

export default function PoliticaDevolucaoPage() {
  return (
    <div className="bg-white text-zinc-800 font-sans">
      <div className="container mx-auto px-4 max-w-3xl py-14 space-y-10">
        <header className="space-y-3">
          <h1 className="font-title text-4xl md:text-5xl text-zinc-900">Política de Trocas e Devoluções</h1>
          <p className="text-xs uppercase tracking-wider text-zinc-500">Atualizada em {UPDATED_AT}</p>
          <p className="text-sm md:text-base leading-relaxed text-zinc-700">
            Cada peça da Saving Throw é produzida sob encomenda e com cuidado artesanal. Se algo não sair como você
            esperava, estas são as regras para desistir da compra, trocar ou devolver um produto — todas de acordo
            com o Código de Defesa do Consumidor.
          </p>
        </header>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-zinc-800">
          <p className="font-bold mb-2">Resumo</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>{RETURN_WINDOW_DAYS} dias</strong> após o recebimento para desistir da compra, sem precisar justificar.</li>
            <li><strong>90 dias</strong> para reclamar de defeitos, contados do recebimento ou, se o defeito for oculto, da data em que ele aparecer.</li>
            <li><strong>Custo da devolução por nossa conta</strong> nos dois casos.</li>
            <li><strong>Na desistência, reembolso imediato</strong> de todos os valores pagos, incluindo o frete, com atualização monetária.</li>
          </ul>
        </div>

        <Section title={`Desistência da compra (${RETURN_WINDOW_DAYS} dias)`}>
          <p>
            Você pode desistir da compra em até {RETURN_WINDOW_DAYS} dias corridos contados da data em que recebeu o
            produto, sem precisar informar o motivo (art. 49 do Código de Defesa do Consumidor). Isso vale para todos os
            produtos, inclusive miniaturas personalizadas e o Escudo do Mestre com personalização.
          </p>
          <p>
            Você pode abrir a embalagem e conferir o produto. Devolva a peça com os itens que a acompanham (caixa,
            folhetos e acessórios) e sem uso além do necessário para essa conferência. Danos causados por uso indevido,
            pintura ou modificação são avaliados caso a caso.
          </p>
        </Section>

        <Section title="Defeitos e avarias no transporte (90 dias)">
          <p>
            Se o produto chegar quebrado, com defeito de impressão, pintura ou montagem, ou diferente do que foi
            pedido, avise em até 90 dias após o recebimento. Se o defeito for oculto, ou seja, só aparecer depois, os
            90 dias contam da data em que ele ficar evidente (art. 26 do CDC). Para agilizar, envie fotos da peça e da
            embalagem assim que notar o problema.
          </p>
          <p>
            Temos até 30 dias para resolver o defeito. Se ele não for resolvido nesse prazo, você escolhe entre a
            substituição por um produto da mesma espécie, em perfeitas condições, a devolução imediata do valor pago,
            com atualização monetária, ou um abatimento proporcional no preço (art. 18 do CDC).
          </p>
          <p>
            Pequenas variações naturais do processo artesanal (tons de pintura, textura da resina, marcas mínimas de
            impressão) não são consideradas defeito, desde que não comprometam a peça.
          </p>
        </Section>

        <Section title="Como solicitar">
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Fale com a gente pelo{' '}
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="text-amber-700 font-bold underline">WhatsApp (27) 99794-7604</a>{' '}
              informando o nome usado no pedido, o produto e o motivo (desistência ou defeito, com fotos).
            </li>
            <li>Combinamos com você a forma de devolução, sem custo para você.</li>
            <li>Embale a peça com cuidado, de preferência na embalagem original, e envie conforme combinado.</li>
            <li>Confirmamos o reembolso ou a solução do defeito pelo mesmo canal.</li>
          </ol>
        </Section>

        <Section title="Reembolso">
          <p>
            Na desistência, devolvemos de imediato todos os valores pagos, incluindo o frete, com atualização monetária,
            pelo mesmo meio de pagamento usado na compra (art. 49 do CDC). Em compras no cartão de crédito, avisamos a
            operadora de imediato para fazer o estorno, e a data em que ele aparece na fatura depende dela.
          </p>
        </Section>

        <Section title="Trocas">
          <p>
            Trocas são feitas nos casos de defeito ou de produto diferente do pedido. Se você desistiu da compra e quer
            outro produto, fazemos o reembolso e você realiza um novo pedido.
          </p>
        </Section>

        <Section title="Dúvidas">
          <p>
            Qualquer dúvida sobre trocas e devoluções, chame no{' '}
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="text-amber-700 font-bold underline">WhatsApp</a>.
            Veja também o nosso <Link href="/miniaturas" className="text-amber-700 font-bold underline">catálogo de miniaturas</Link>.
          </p>
        </Section>
      </div>
    </div>
  );
}
