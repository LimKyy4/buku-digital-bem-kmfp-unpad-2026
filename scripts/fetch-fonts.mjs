import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const fontsDir = path.join(rootDir, 'public', 'assets', 'fonts');
const stylesDir = path.join(rootDir, 'src', 'styles');
const cssFilePath = path.join(stylesDir, 'typography.css');

const fontDefinitions = [
  {
    family: 'Syne',
    weight: '700',
    style: 'normal',
    filename: 'syne-700.woff2',
    url: 'https://cdn.jsdelivr.net/fontsource/fonts/syne@latest/latin-700-normal.woff2'
  },
  {
    family: 'Syne',
    weight: '800',
    style: 'normal',
    filename: 'syne-800.woff2',
    url: 'https://cdn.jsdelivr.net/fontsource/fonts/syne@latest/latin-800-normal.woff2'
  },
  {
    family: 'Plus Jakarta Sans',
    weight: '400',
    style: 'normal',
    filename: 'plus-jakarta-sans-400.woff2',
    url: 'https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-400-normal.woff2'
  },
  {
    family: 'Plus Jakarta Sans',
    weight: '500',
    style: 'normal',
    filename: 'plus-jakarta-sans-500.woff2',
    url: 'https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-500-normal.woff2'
  },
  {
    family: 'Plus Jakarta Sans',
    weight: '600',
    style: 'normal',
    filename: 'plus-jakarta-sans-600.woff2',
    url: 'https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-600-normal.woff2'
  }
];

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function downloadFont(font) {
  const destPath = path.join(fontsDir, font.filename);
  console.log(`[DOWNLOAD] Mengunduh font ${font.family} (${font.weight}): ${font.filename}`);
  
  const response = await fetch(font.url);
  if (!response.ok) {
    throw new Error(`Gagal mengunduh font ${font.filename} dari ${font.url}: HTTP ${response.status}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  await fs.writeFile(destPath, buffer);
  const sizeKb = (buffer.length / 1024).toFixed(2);
  console.log(`[SUCCESS] Tersimpan: ${font.filename} (${sizeKb} KB)`);
}

function generateTypographyCss(fonts) {
  const declarations = fonts.map(font => {
    return `@font-face {
  font-family: '${font.family}';
  font-style: ${font.style};
  font-weight: ${font.weight};
  font-display: swap;
  src: url('../../public/assets/fonts/${font.filename}') format('woff2');
}`;
  });

  const header = `/* Deklarasi Tipografi Resmi Grand Design Biro Keuangan BEM KMFP UNPAD 2026 */
/* Font Display: swap untuk mencegah layout shift dan render blocking */
`;

  return header + '\n' + declarations.join('\n\n') + '\n';
}

async function main() {
  console.log('[START] Memulai pengunduhan dan penataan font lokal WOFF2');
  await ensureDir(fontsDir);
  await ensureDir(stylesDir);

  for (const font of fontDefinitions) {
    await downloadFont(font);
  }

  const cssContent = generateTypographyCss(fontDefinitions);
  await fs.writeFile(cssFilePath, cssContent, 'utf8');
  console.log(`[SUCCESS] Berkas deklarasi font dibuat di: ${path.relative(rootDir, cssFilePath)}`);
  console.log('[FINISH] Pengunduhan font selesai dan terverifikasi');
}

main().catch(err => {
  console.error('[ERROR] Terjadi kegagalan pada skrip fetch-fonts:', err.message);
  process.exit(1);
});
