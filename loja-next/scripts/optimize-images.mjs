// Gera versões leves das imagens do site (os originais chegam a 16 MB e derrubam a velocidade/SEO):
//   assets/imagens/<nome>.webp   até 1600px de largura, para exibir no site
//   assets/og/<nome>.jpg         1200x630, para cards de compartilhamento (Open Graph/Twitter)
// Os originais ficam intactos (o site Vite ainda usa). Rode de novo ao adicionar imagens:
//   npm run optimize-images
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.resolve(here, '../../frontend/public/assets');
const srcDir = path.join(assets, 'imagens');
const ogDir = path.join(assets, 'og');
mkdirSync(ogDir, { recursive: true });

const isRaster = (f) => /\.(png|jpe?g)$/i.test(f) && !/^favicon\./i.test(f);
const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

// Só regera quando o original é mais novo que a saída.
const stale = (src, out) => !existsSync(out) || statSync(out).mtimeMs < statSync(src).mtimeMs;

for (const file of readdirSync(srcDir).filter(isRaster)) {
  const src = path.join(srcDir, file);
  const base = file.replace(/\.[^.]+$/, '');
  const webp = path.join(srcDir, `${base}.webp`);
  const og = path.join(ogDir, `${base}.jpg`);

  if (stale(src, webp)) {
    await sharp(src).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(webp);
    console.log(`webp  ${file}: ${kb(statSync(src).size)} -> ${kb(statSync(webp).size)}`);
  }
  if (stale(src, og)) {
    await sharp(src).rotate().resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 82, mozjpeg: true }).toFile(og);
    console.log(`og    ${file}: -> ${kb(statSync(og).size)}`);
  }
}
