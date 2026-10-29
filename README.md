# Saving Throw

Repositório da loja e das ferramentas da Saving Throw.

| Pasta | O que é |
|---|---|
| [`loja-next/`](loja-next/README.md) | **O site** (savingthrow.com.br): loja, páginas do Sistema ST, mesa de sons e painel admin, em Next.js. É o que a Vercel publica. |
| `scripts/` | Utilitários de linha de comando: seed do banco, parse de PDFs, envio em lote ao Mercado Livre (`npm install` na raiz; usam `DATABASE_URL` do `.env`). |
| `3d-backend/` | Servidor Python da Forja 3D (imagem → modelo 3D). Ainda não hospedado; a página `/modelador` depende dele. |
| `Sistema ST/` | Sistema de gestão local separado (Express + JSON + Python), não faz parte do site. |
