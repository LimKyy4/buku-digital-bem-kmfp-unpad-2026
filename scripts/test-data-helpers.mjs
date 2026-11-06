import esbuild from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function testHelpers() {
  console.log('[TEST] Menjalankan verifikasi fungsional helper functions di src/config/pagesData.ts...');

  // Transpile TypeScript pagesData ke temporary bundle
  const result = await esbuild.build({
    entryPoints: [path.join(rootDir, 'src', 'config', 'pagesData.ts')],
    bundle: false,
    write: false,
    format: 'esm',
    platform: 'node',
    target: 'node20'
  });

  const jsCode = result.outputFiles[0].text;
  const dataUri = `data:text/javascript;base64,${Buffer.from(jsCode).toString('base64')}`;
  const pagesModule = await import(dataUri);

  const {
    pagesData,
    chapterSections,
    hotspotCoordinates,
    getPageByNumber,
    getPageByIndex,
    getAllChapters,
    getChapterById,
    getChapterForPage,
    getHotspotsForPage,
    getTotalPages,
    getChapterNavigationList
  } = pagesModule;

  // 1. Total Pages
  if (getTotalPages() !== 23) {
    throw new Error(`Total halaman bukan 23, melainkan ${getTotalPages()}`);
  }
  console.log('[PASS] getTotalPages() mengembalikan tepat 23 halaman.');

  // 2. getPageByNumber
  const p1 = getPageByNumber(1);
  if (!p1 || !p1.title.includes('Cover') || p1.pageType !== 'front-cover') {
    throw new Error('Halaman 1 tidak valid');
  }
  const p23 = getPageByNumber(23);
  if (!p23 || !p23.title.includes('Penutup') || p23.pageType !== 'back-cover') {
    throw new Error('Halaman 23 tidak valid');
  }
  console.log('[PASS] getPageByNumber(1) dan getPageByNumber(23) valid.');

  // 3. getPageByIndex
  const pIndex0 = getPageByIndex(0);
  if (!pIndex0 || pIndex0.pageNumber !== 1) {
    throw new Error('getPageByIndex(0) tidak cocok dengan Halaman 1');
  }
  console.log('[PASS] getPageByIndex(0) valid.');

  // 4. getAllChapters
  const chapters = getAllChapters();
  if (chapters.length !== 5) {
    throw new Error(`Jumlah bab bukan 5, melainkan ${chapters.length}`);
  }
  console.log('[PASS] getAllChapters() mengembalikan tepat 5 bab navigasi.');

  // 5. getChapterById
  const bab3 = getChapterById('bagian-3') || getChapterById('bab-3');
  if (!bab3 || !bab3.title.includes('Program Kerja')) {
    throw new Error('getChapterById("bagian-3") tidak valid');
  }
  console.log('[PASS] getChapterById("bagian-3") valid.');

  // 6. getChapterForPage
  const chForP21 = getChapterForPage(21);
  if (!chForP21 || (chForP21.id !== 'bagian-3' && chForP21.id !== 'bab-3')) {
    throw new Error('Halaman 21 seharusnya dinaungi oleh Bagian 3 (Program Kerja Utama)');
  }
  const chForP16 = getChapterForPage(16);
  if (!chForP16 || (chForP16.id !== 'bagian-4' && chForP16.id !== 'bab-4')) {
    throw new Error('Halaman 16 seharusnya dinaungi oleh Bagian 4 (Regulasi SIAT)');
  }
  console.log('[PASS] getChapterForPage(21) dan getChapterForPage(16) terpetakan dengan benar.');

  // 7. getHotspotsForPage
  const hotspotsP22 = getHotspotsForPage(22);
  if (hotspotsP22.length !== 1 || hotspotsP22[0].targetUrl !== 'https://bit.ly/TEMPLATERABBEMKMFP26' || hotspotsP22[0].interactionType !== 'download') {
    throw new Error('Hotspot Halaman 22 tidak valid');
  }
  console.log('[PASS] getHotspotsForPage(22) valid.');

  // 8. getChapterNavigationList
  const navList = getChapterNavigationList();
  if (navList.length !== 5 || navList[0].startPage !== 1 || navList[4].startPage !== 22) {
    throw new Error('getChapterNavigationList() tidak valid');
  }
  console.log('[PASS] getChapterNavigationList() mengembalikan 5 bab beserta startPage yang valid.');

  console.log('[SUCCESS] Seluruh pengujian logika runtime fungsi pembantu berhasil 100%.');
}

testHelpers().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
