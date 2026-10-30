import Link from 'next/link';
import { WHATSAPP_URL, pageMetadata } from '@/lib/site';

/*
 * Política de trocas e devoluções (exigida pelo Google Merchant Center).
 * Baseada no Código de Defesa do Consumidor (arts. 18, 26 e 49). Ao mudar prazos aqui,
 * atualize também a configuração de devolução no Merchant Center e o JSON-LD em (loja)/layout.tsx.
 */

const UPDATED_AT = '30 de outubro de 2026';
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
            <li><strong>90 dias</strong> após o recebimento para avisar sobre defeitos de fabricação.</li>
            <li><strong>Frete da devolução por nossa conta</strong> nos dois casos.</li>
            <li><strong>Reembolso integral</strong> (produto + frete pago) em até 7 dias úteis após recebermos a peça.</li>
          </ul>
        </div>

        <Section title={`Desistência da compra (${RETURN_WINDOW_DAYS} dias)`}>
          <p>
            Você pode desistir da compra em até {RETURN_WINDOW_DAYS} dias corridos contados da data em que recebeu o
            produto, sem precisar informar o motivo (art. 49 do Código de Defesa do Consumidor). Isso vale para todos os
            produtos, inclusive miniaturas personalizadas e o Escudo do Mestre com personalização.
          </p>
          <p>
            Para que a devolução seja aceita, a peça deve voltar sem sinais de uso, sem ter sido pintada, modificada ou
            danificada, e com todos os itens que a acompanham (caixa, folhetos e acessórios).
          </p>
        </Section>

        <Section title="Defeitos e avarias no transporte (90 dias)">
          <p>
            Se o produto chegar quebrado, com defeito de impressão, pintura ou montagem, ou diferente do que foi
            pedido, avise em até 90 dias após o recebimento (art. 26 do CDC). Para agilizar, envie fotos da peça e da
            embalagem assim que notar o problema — de preferência no mesmo dia em que receber.
          </p>
          <p>
            Depois de analisar o caso, refazemos ou reparamos a peça em até 30 dias. Se não for possível, você escolhe
            entre a troca por outro produto, o reembolso integral ou um abatimento proporcional no preço (art. 18 do CDC).
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
            <li>Enviamos as instruções e o código de postagem dos Correios para a devolução, sem custo para você.</li>
            <li>Embale a peça com cuidado, de preferência na embalagem original, e poste dentro do prazo informado.</li>
            <li>Quando a peça chegar, conferimos e confirmamos a troca ou o reembolso pelo mesmo canal.</li>
          </ol>
        </Section>

        <Section title="Reembolso">
          <p>
            O reembolso é integral — valor do produto mais o frete pago no envio — e é feito pelo mesmo meio de
            pagamento usado na compra, em até 7 dias úteis após recebermos a peça. Em compras no cartão de crédito,
            o estorno pode aparecer em até duas faturas, conforme a operadora.
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
