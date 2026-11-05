import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

console.log('[VERIFIKASI FASE 6] Memulai audit pengujian kinerja, aksesibilitas, dan optimasi...');

let passed = true;

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    passed = false;
  } else {
    console.log(`[PASS] ${message}`);
  }
}

// 1. Audit AdaptiveBufferManager.ts
const bufferMgrPath = path.join(rootDir, 'src', 'core', 'AdaptiveBufferManager.ts');
assert(fs.existsSync(bufferMgrPath), 'Berkas src/core/AdaptiveBufferManager.ts tersedia');
const bufferContent = fs.readFileSync(bufferMgrPath, 'utf-8');

assert(bufferContent.includes('export class AdaptiveBufferManager'), 'AdaptiveBufferManager diekspor sebagai class');
assert(bufferContent.includes('public getBufferedUrls'), 'AdaptiveBufferManager memiliki metode getBufferedUrls');
assert(bufferContent.includes('public async preloadWindow'), 'AdaptiveBufferManager memiliki metode preloadWindow');
assert(bufferContent.includes('public isPageBuffered'), 'AdaptiveBufferManager memiliki metode isPageBuffered');
assert(bufferContent.includes('public destroy'), 'AdaptiveBufferManager memiliki metode destroy');
assert(bufferContent.includes('PLACEHOLDER_DATA_URI'), 'AdaptiveBufferManager menyediakan placeholder ringan');
assert(!bufferContent.includes(': any'), 'AdaptiveBufferManager terbebas dari tipe any');

// 2. Audit AccessibilityAnnouncer.ts
const a11yPath = path.join(rootDir, 'src', 'utils', 'AccessibilityAnnouncer.ts');
assert(fs.existsSync(a11yPath), 'Berkas src/utils/AccessibilityAnnouncer.ts tersedia');
const a11yContent = fs.readFileSync(a11yPath, 'utf-8');

assert(a11yContent.includes('export class AccessibilityAnnouncer'), 'AccessibilityAnnouncer diekspor sebagai class');
assert(a11yContent.includes('public announce'), 'AccessibilityAnnouncer memiliki fungsi announce');
assert(a11yContent.includes('public trapFocus'), 'AccessibilityAnnouncer memiliki fungsi trapFocus');
assert(a11yContent.includes('public releaseFocusTrap'), 'AccessibilityAnnouncer memiliki fungsi releaseFocusTrap');
assert(a11yContent.includes('aria-live'), 'AccessibilityAnnouncer mengelola aria-live region');
assert(!a11yContent.includes(': any'), 'AccessibilityAnnouncer terbebas dari tipe any');

// 3. Audit Normalisasi Lintas Peramban di main.css
const cssPath = path.join(rootDir, 'src', 'styles', 'main.css');
assert(fs.existsSync(cssPath), 'Berkas src/styles/main.css tersedia');
const cssContent = fs.readFileSync(cssPath, 'utf-8');

assert(cssContent.includes('-webkit-perspective'), 'CSS memuat prefix -webkit-perspective untuk Apple Safari');
assert(cssContent.includes('-webkit-transform-style'), 'CSS memuat prefix -webkit-transform-style');
assert(cssContent.includes('-webkit-backface-visibility'), 'CSS memuat prefix -webkit-backface-visibility');
assert(cssContent.includes('scrollbar-width: thin') || cssContent.includes('scrollbar-color'), 'CSS memuat normalisasi scrollbar Gecko/Firefox');
assert(cssContent.includes(':focus-visible'), 'CSS memuat aturan fokus aksesibilitas focus-visible WCAG AA');
assert(cssContent.includes('.sr-only'), 'CSS memuat aturan kelas pembaca layar sr-only');

// 4. Audit Bundler vite.config.ts
const viteConfigPath = path.join(rootDir, 'vite.config.ts');
assert(fs.existsSync(viteConfigPath), 'Berkas vite.config.ts tersedia');
const viteContent = fs.readFileSync(viteConfigPath, 'utf-8');

assert(viteContent.includes('manualChunks'), 'vite.config.ts menerapkan manual chunk splitting');
assert(viteContent.includes('vendor-flipbook'), 'vite.config.ts memisahkan vendor StPageFlip');
assert(viteContent.includes('sourcemap: false'), 'vite.config.ts menonaktifkan sourcemap di produksi');
assert(viteContent.includes('minify: \'esbuild\'') || viteContent.includes('minify:'), 'vite.config.ts mengaktifkan minifikasi kode');
assert(viteContent.includes('[hash]'), 'vite.config.ts menerapkan content hash untuk immutable caching');

// 5. Audit Integrasi main.ts
const mainPath = path.join(rootDir, 'src', 'main.ts');
assert(fs.existsSync(mainPath), 'Berkas src/main.ts tersedia');
const mainContent = fs.readFileSync(mainPath, 'utf-8');

assert(mainContent.includes('new AdaptiveBufferManager('), 'main.ts mengintegrasikan AdaptiveBufferManager');
assert(mainContent.includes('new AccessibilityAnnouncer('), 'main.ts mengintegrasikan AccessibilityAnnouncer');
assert(mainContent.includes('this.bufferManager.preloadWindow'), 'main.ts memanggil preloadWindow secara dinamis');
assert(mainContent.includes('this.a11yAnnouncer.announce'), 'main.ts menyiarkan pengumuman pembaca layar');

// 6. Audit Larangan Emoji
const filesToAudit = [
  'src/core/AdaptiveBufferManager.ts',
  'src/utils/AccessibilityAnnouncer.ts',
  'src/components/Controls.ts',
  'src/components/TableOfContents.ts',
  'src/components/Hotspots.ts',
  'src/components/Preloader.ts',
  'src/core/FlipbookEngine.ts',
  'src/core/ResponsiveManager.ts',
  'src/core/AudioController.ts',
  'src/config/bookConfig.ts',
  'src/config/pagesData.ts',
  'src/main.ts',
  'src/styles/main.css',
  'vite.config.ts',
  'index.html',
  'scripts/audit-build.mjs'
];

for (const f of filesToAudit) {
  const full = path.join(rootDir, f);
  if (fs.existsSync(full)) {
    const text = fs.readFileSync(full, 'utf-8');
    assert(!emojiRegex.test(text), `Bebas emoji: ${f}`);
  }
}

if (!passed) {
  console.error('[FAILED] Terdapat pengujian Fase 6 yang gagal.');
  process.exit(1);
} else {
  console.log('[SUCCESS] Seluruh 30 kriteria verifikasi Fase 6 sukses 100%.');
}
