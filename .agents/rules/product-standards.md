# Padrões e Diretrizes de Criação de Produtos - Saving Throw

Este documento define as regras de negócio e geração automática de conteúdo para qualquer produto criado ou exibido no ecossistema Saving Throw.

## 1. Categorização Inteligente de Produtos

Cada produto deve ser categorizado de acordo com suas características técnicas e materiais:

| Categoria | Identificadores / Palavras-chave | Material / Tag | Badges Principais |
| :--- | :--- | :--- | :--- |
| **Miniaturas de Resina** | `miniatura`, `npcs`, `monstros`, `cenario`, `mini` | Resina Premium 8K | Alta Definição • Curada & Lavada • Envio Nacional |
| **Arsenal & Escudos** | `arsenal`, `escudo`, `escudos`, `mdf`, `painel` | MDF Nobre & Corte Laser | Corte a Laser • Estrutura Nobre • Envio Nacional |
| **Acessórios de Dados** | `dados`, `torre`, `bandeja`, `dice tray`, `dice tower` | Corte a Laser & Forração | Rolagem Precisa • Amortecimento • Envio Nacional |
| **One Shots & Aventuras** | `oneshot`, `aventura`, `kit`, `campanha`, `livro` | Material Físico Completo | História Pronta • Miniaturas Inclusas • Envio Nacional |
| **Serviço Exclusivo** | `personalizada`, `dê vida ao seu herói`, `exclusivo` | Feito Sob Medida | 100% Sob Medida • Caixa de MDF • Envio Nacional |

---

## 2. Regra Obrigatória de Envio e Prazos

> [!IMPORTANT]
> O texto da especificação de Envio para **TODOS** os produtos deve ser estritamente:
> **"O envio é feito via Correios ou transportadora para todo o país."**
> 
> ⛔ **NÃO** mencionar embalagens com cápsula de proteção, plástico bolha ou detalhes similares em nenhuma categoria.

---

## 3. Estrutura de Preços e Opções de Acabamento

1. **Produtos de Resina (Miniaturas)**:
   - Suportam valor duplo: `price_unpainted` (Sem Pintura) e `price_painted` (Com Pintura Artística).
   - O seletor da página de produto deve permitir alternar e recalcular o valor em tempo real.
2. **Produtos de Preço Único (Arsenal, Escudos, Acessórios, Livros)**:
   - Exibem o valor padrão direto (`price`), ocultando seletores desnecessários.

---

## 4. Integração com WhatsApp

A mensagem gerada para o WhatsApp (`5527997947604`) no botão **"Encomendar via WhatsApp"** deve seguir o padrão:

```text
Olá Saving Throw! 🎲

Tenho interesse em encomendar o produto:
*Item:* [Nome do Produto]
*Opção:* [Opção Selecionada ou Padrão]
*Valor Estimado:* R$ [Valor Formatado]

Gostaria de saber mais informações e combinar o pagamento e envio!
```
