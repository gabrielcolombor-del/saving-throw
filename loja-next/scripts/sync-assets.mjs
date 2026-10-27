// Copia os arquivos estáticos do frontend Vite (fonte única durante a migração) para public/.
// Assim não duplicamos ~130MB de imagens/sons/PDFs no Git. Quando o Vite for desligado,
// basta mover frontend/public/assets para loja-next/public/assets e remover este script.
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, '../../frontend/public/assets');
const dest = path.resolve(here, '../public/assets');

if (!existsSync(src)) {
  console.warn(`[sync-assets] ${src} não encontrado; pulando (assets já devem estar em public/assets).`);
  process.exit(0);
}

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true, force: true });
console.log(`[sync-assets] assets copiados de ${src}`);
