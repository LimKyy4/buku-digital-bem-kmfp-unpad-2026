import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

console.log('[VERIFIKASI FASE 5] Memulai audit komprehensif Komponen Antarmuka Pengguna (UI Layer)...');

let passed = true;

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    passed = false;
  } else {
    console.log(`[PASS] ${message}`);
  }
}

// 1. Audit Controls.ts
const controlsPath = path.join(rootDir, 'src', 'components', 'Controls.ts');
assert(fs.existsSync(controlsPath), 'Berkas src/components/Controls.ts tersedia');
const controlsContent = fs.readFileSync(controlsPath, 'utf-8');

assert(controlsContent.includes('export class Controls'), 'Controls diekspor sebagai class');
assert(controlsContent.includes('backdrop-blur'), 'Controls menerapkan efek blur kaca backdrop-blur');
assert(controlsContent.includes('fixed bottom-'), 'Controls berposisi mengambang (floating bar) di bawah');
assert(controlsContent.includes('public updatePage'), 'Controls memiliki metode updatePage');
assert(controlsContent.includes('public updateAudio'), 'Controls memiliki metode updateAudio');
assert(controlsContent.includes('public updateFullscreen'), 'Controls memiliki metode updateFullscreen');
assert(controlsContent.includes('public toggleFullscreenCrossBrowser'), 'Controls memiliki metode toggleFullscreenCrossBrowser lintas peramban');
assert(controlsContent.includes('public onPrev'), 'Controls memiliki callback onPrev');
assert(controlsContent.includes('public onNext'), 'Controls memiliki callback onNext');
assert(controlsContent.includes('public onPageJump'), 'Controls memiliki callback onPageJump');
assert(controlsContent.includes('public onToggleToc'), 'Controls memiliki callback onToggleToc');
assert(controlsContent.includes('public onToggleAudio'), 'Controls memiliki callback onToggleAudio');
assert(controlsContent.includes('public onToggleFullscreen'), 'Controls memiliki callback onToggleFullscreen');
assert(controlsContent.includes('public destroy'), 'Controls memiliki metode destroy');
assert(controlsContent.includes('<svg'), 'Controls menggunakan inline SVG untuk ikon navigasi');
assert(!controlsContent.includes(': any'), 'Controls terbebas dari tipe any');

// 2. Audit TableOfContents.ts
const tocPath = path.join(rootDir, 'src', 'components', 'TableOfContents.ts');
assert(fs.existsSync(tocPath), 'Berkas src/components/TableOfContents.ts tersedia');
const tocContent = fs.readFileSync(tocPath, 'utf-8');

assert(tocContent.includes('export class TableOfContents'), 'TableOfContents diekspor sebagai class');
assert(tocContent.includes('public open'), 'TableOfContents memiliki metode open');
assert(tocContent.includes('public close'), 'TableOfContents memiliki metode close');
assert(tocContent.includes('public toggle'), 'TableOfContents memiliki metode toggle');
assert(tocContent.includes('public isOpened'), 'TableOfContents memiliki metode isOpened');
assert(tocContent.includes('public updateActivePage'), 'TableOfContents memiliki metode updateActivePage');
assert(tocContent.includes('public onSelectPage'), 'TableOfContents memiliki callback onSelectPage');
assert(tocContent.includes('public destroy'), 'TableOfContents memiliki metode destroy');
assert(tocContent.includes('font-display'), 'TableOfContents menggunakan font Syne (font-display) untuk judul');
assert(tocContent.includes('font-sans'), 'TableOfContents menggunakan font Plus Jakarta Sans (font-sans) untuk deskripsi');
assert(tocContent.includes('chapterSections'), 'TableOfContents menyajikan 5 bab terstruktur');
assert(tocContent.includes('AKTIF'), 'TableOfContents memiliki badge penanda bab/halaman aktif');
assert(!tocContent.includes(': any'), 'TableOfContents terbebas dari tipe any');

// 3. Audit Hotspots.ts
const hotspotsPath = path.join(rootDir, 'src', 'components', 'Hotspots.ts');
assert(fs.existsSync(hotspotsPath), 'Berkas src/components/Hotspots.ts tersedia');
const hotspotsContent = fs.readFileSync(hotspotsPath, 'utf-8');

assert(hotspotsContent.includes('export class Hotspots'), 'Hotspots diekspor sebagai class');
assert(hotspotsContent.includes('public renderForPage'), 'Hotspots memiliki metode renderForPage');
assert(hotspotsContent.includes('public syncBounds'), 'Hotspots memiliki metode syncBounds');
assert(hotspotsContent.includes('public getActivePage'), 'Hotspots memiliki metode getActivePage');
assert(hotspotsContent.includes('public getDisplayMode'), 'Hotspots memiliki metode getDisplayMode');
assert(hotspotsContent.includes('public destroy'), 'Hotspots memiliki metode destroy');
assert(hotspotsContent.includes('noopener noreferrer'), 'Hotspots menerapkan rel="noopener noreferrer"');
assert(hotspotsContent.includes('targetUrl'), 'Hotspots menghubungkan URL target');
assert(hotspotsContent.includes('calcLeft = data.leftPercent / 2') || hotspotsContent.includes('isLeftSpreadPage'), 'Hotspots mendukung kalkulasi mode dua lembar spread');
assert(!hotspotsContent.includes(': any'), 'Hotspots terbebas dari tipe any');

// 4. Audit Preloader.ts
const preloaderPath = path.join(rootDir, 'src', 'components', 'Preloader.ts');
assert(fs.existsSync(preloaderPath), 'Berkas src/components/Preloader.ts tersedia');
const preloaderContent = fs.readFileSync(preloaderPath, 'utf-8');

assert(preloaderContent.includes('export class Preloader'), 'Preloader diekspor sebagai class');
assert(preloaderContent.includes('public async preloadImages'), 'Preloader memiliki metode preloadImages');
assert(preloaderContent.includes('public updateProgress'), 'Preloader memiliki metode updateProgress');
assert(preloaderContent.includes('public hide'), 'Preloader memiliki metode hide');
assert(preloaderContent.includes('public show'), 'Preloader memiliki metode show');
assert(preloaderContent.includes('public destroy'), 'Preloader memiliki metode destroy');
assert(!preloaderContent.includes(': any'), 'Preloader terbebas dari tipe any');

// 5. Audit main.ts Wiring
const mainPath = path.join(rootDir, 'src', 'main.ts');
const mainContent = fs.readFileSync(mainPath, 'utf-8');

assert(mainContent.includes('preloadImages'), 'main.ts melakukan pra-pemuatan aset via Preloader');
assert(mainContent.includes('this.controls.updatePage'), 'main.ts memperbarui Controls saat halaman berganti');
assert(mainContent.includes('this.toc.updateActivePage'), 'main.ts memperbarui TableOfContents saat halaman berganti');
assert(mainContent.includes('this.hotspots.renderForPage'), 'main.ts memperbarui Hotspots saat halaman berganti');
assert(mainContent.includes('this.hotspots.syncBounds'), 'main.ts menyinkronkan ukuran Hotspots dengan buku');

// 6. Audit Larangan Emoji
const componentFiles = [
  'src/components/Controls.ts',
  'src/components/TableOfContents.ts',
  'src/components/Hotspots.ts',
  'src/components/Preloader.ts',
  'src/main.ts',
  'src/styles/main.css'
];

for (const f of componentFiles) {
  const full = path.join(rootDir, f);
  if (fs.existsSync(full)) {
    const text = fs.readFileSync(full, 'utf-8');
    assert(!emojiRegex.test(text), `Bebas emoji: ${f}`);
  }
}

if (!passed) {
  console.error('[FAILED] Terdapat kriteria Fase 5 yang gagal.');
  process.exit(1);
} else {
  console.log('[SUCCESS] Seluruh kriteria verifikasi Fase 5 sukses 100%.');
}
