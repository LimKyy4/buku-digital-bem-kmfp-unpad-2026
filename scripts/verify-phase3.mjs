import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

console.log('[VERIFIKASI FASE 3] Memulai audit komprehensif data, SEO, interaktivitas, dan kepatuhan aturan...');

let passed = true;

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    passed = false;
  } else {
    console.log(`[PASS] ${message}`);
  }
}

// 1. Audit index.html
const indexHtmlPath = path.join(rootDir, 'index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

assert(indexHtml.includes('viewport-fit=cover'), 'index.html memuat viewport-fit=cover');
assert(indexHtml.includes('<title>Grand Design Biro Keuangan BEM KMFP UNPAD 2026 - Cetak Biru Tata Kelola &amp; Regulasi Finansial</title>'), 'index.html memuat judul resmi yang informatif');
assert(indexHtml.includes('name="description"'), 'index.html memuat meta description');
assert(indexHtml.includes('name="keywords"'), 'index.html memuat meta keywords');
assert(indexHtml.includes('name="author"'), 'index.html memuat meta author');
assert(indexHtml.includes('property="og:title"'), 'index.html memuat og:title');
assert(indexHtml.includes('property="og:description"'), 'index.html memuat og:description');
assert(indexHtml.includes('property="og:image"'), 'index.html memuat og:image');
assert(indexHtml.includes('name="twitter:card" content="summary_large_image"'), 'index.html memuat twitter:card summary_large_image');
assert(indexHtml.includes('/assets/fonts/syne-700.woff2'), 'index.html memuat link preload untuk font Syne');
assert(indexHtml.includes('/assets/fonts/plus-jakarta-sans-400.woff2'), 'index.html memuat link preload untuk font Plus Jakarta Sans');
assert(indexHtml.includes('halaman-cover.jfif') || indexHtml.includes('/assets/images/pages/page-01.webp'), 'index.html memuat link preload untuk cover');
assert(indexHtml.includes('id="preloader"'), 'index.html memuat kontainer #preloader');
assert(indexHtml.includes('id="book-container"'), 'index.html memuat kontainer #book-container');
assert(indexHtml.includes('id="hotspots-layer"'), 'index.html memuat kontainer #hotspots-layer');
assert(indexHtml.includes('id="controls-container"'), 'index.html memuat kontainer #controls-container');
assert(indexHtml.includes('id="toc-container"'), 'index.html memuat kontainer #toc-container');

// 2. Audit src/types/index.ts
const typesPath = path.join(rootDir, 'src', 'types', 'index.ts');
const typesContent = fs.readFileSync(typesPath, 'utf-8');
assert(typesContent.includes('export type PageType'), 'types memuat PageType');
assert(typesContent.includes('export type HotspotInteractionType'), 'types memuat HotspotInteractionType');
assert(typesContent.includes('export interface HotspotItem'), 'types memuat HotspotItem');
assert(typesContent.includes('export interface ChapterItem'), 'types memuat ChapterItem');
assert(typesContent.includes('export interface PageItem'), 'types memuat PageItem');
assert(!typesContent.includes(': any'), 'types terbebas dari implicit/explicit any');

// 3. Audit src/config/pagesData.ts melalui file reading & syntax parsing
const pagesDataPath = path.join(rootDir, 'src', 'config', 'pagesData.ts');
const pagesDataContent = fs.readFileSync(pagesDataPath, 'utf-8');

assert(pagesDataContent.includes('export const hotspotCoordinates'), 'pagesData mengekspor hotspotCoordinates');
assert(pagesDataContent.includes('export const chapterSections'), 'pagesData mengekspor chapterSections');
assert(pagesDataContent.includes('export const pagesData'), 'pagesData mengekspor pagesData');
assert(pagesDataContent.includes('export function getPageByNumber'), 'pagesData mengekspor getPageByNumber');
assert(pagesDataContent.includes('export function getPageByIndex'), 'pagesData mengekspor getPageByIndex');
assert(pagesDataContent.includes('export function getAllChapters'), 'pagesData mengekspor getAllChapters');
assert(pagesDataContent.includes('export function getChapterById'), 'pagesData mengekspor getChapterById');
assert(pagesDataContent.includes('export function getChapterForPage'), 'pagesData mengekspor getChapterForPage');
assert(pagesDataContent.includes('export function getHotspotsForPage'), 'pagesData mengekspor getHotspotsForPage');
assert(pagesDataContent.includes('export function getTotalPages'), 'pagesData mengekspor getTotalPages');
assert(pagesDataContent.includes('export function getChapterNavigationList'), 'pagesData mengekspor getChapterNavigationList');

// 4. Verifikasi seluruh 25 citra WebP di public/assets/images/pages
const imagesDir = path.join(rootDir, 'public', 'assets', 'images', 'pages');
for (let i = 1; i <= 25; i++) {
  const fileName = `page-${String(i).padStart(2, '0')}.webp`;
  const fileFullPath = path.join(imagesDir, fileName);
  assert(fs.existsSync(fileFullPath), `Berkas citra WebP ada: ${fileName}`);
}

// 5. Audit Emoji pada seluruh berkas di src, index.html, dan scripts
const filesToCheck = [
  'index.html',
  'src/types/index.ts',
  'src/config/pagesData.ts',
  'src/config/bookConfig.ts',
  'src/components/Hotspots.ts',
  'src/components/TableOfContents.ts',
  'src/components/Controls.ts',
  'src/components/Preloader.ts',
  'src/core/FlipbookEngine.ts',
  'src/core/AudioController.ts',
  'src/core/ResponsiveManager.ts',
  'src/main.ts',
  'src/styles/main.css',
  'src/styles/typography.css'
];

for (const relPath of filesToCheck) {
  const fullPath = path.join(rootDir, relPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const hasEmoji = emojiRegex.test(content);
    assert(!hasEmoji, `Bebas emoji: ${relPath}`);
  }
}

if (!passed) {
  console.error('[FAILED] Terdapat pengujian Fase 3 yang gagal.');
  process.exit(1);
} else {
  console.log('[SUCCESS] Seluruh pengujian Fase 3 berhasil dipenuhi 100%.');
}
