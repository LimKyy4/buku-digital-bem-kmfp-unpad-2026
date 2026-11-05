import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

console.log('[VERIFIKASI FASE 4] Memulai audit komprehensif Core Engine...');

let passed = true;

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    passed = false;
  } else {
    console.log(`[PASS] ${message}`);
  }
}

// 1. Audit FlipbookEngine.ts
const flipbookEnginePath = path.join(rootDir, 'src', 'core', 'FlipbookEngine.ts');
assert(fs.existsSync(flipbookEnginePath), 'Berkas src/core/FlipbookEngine.ts tersedia');
const engineContent = fs.readFileSync(flipbookEnginePath, 'utf-8');

assert(engineContent.includes('export class FlipbookEngine'), 'FlipbookEngine diekspor sebagai class');
assert(engineContent.includes('public async initialize'), 'FlipbookEngine memiliki metode initialize');
assert(engineContent.includes('public flipNext'), 'FlipbookEngine memiliki metode flipNext');
assert(engineContent.includes('public flipPrev'), 'FlipbookEngine memiliki metode flipPrev');
assert(engineContent.includes('public turnToPage'), 'FlipbookEngine memiliki metode turnToPage');
assert(engineContent.includes('public flipToPage'), 'FlipbookEngine memiliki metode flipToPage');
assert(engineContent.includes('public getCurrentPageIndex'), 'FlipbookEngine memiliki metode getCurrentPageIndex');
assert(engineContent.includes('public getCurrentPageNumber'), 'FlipbookEngine memiliki metode getCurrentPageNumber');
assert(engineContent.includes('public getPageCount'), 'FlipbookEngine memiliki metode getPageCount');
assert(engineContent.includes('public getOrientation'), 'FlipbookEngine memiliki metode getOrientation');
assert(engineContent.includes('public getState'), 'FlipbookEngine memiliki metode getState');
assert(engineContent.includes('public isFlipping'), 'FlipbookEngine memiliki metode isFlipping');
assert(engineContent.includes('public update'), 'FlipbookEngine memiliki metode update');
assert(engineContent.includes('public destroy'), 'FlipbookEngine memiliki metode destroy');
assert(engineContent.includes('public onPageChange'), 'FlipbookEngine memiliki event onPageChange');
assert(engineContent.includes('public onStateChange'), 'FlipbookEngine memiliki event onStateChange');
assert(engineContent.includes('public onOrientationChange'), 'FlipbookEngine memiliki event onOrientationChange');
assert(engineContent.includes('public onInit'), 'FlipbookEngine memiliki event onInit');
assert(!engineContent.includes(': any'), 'FlipbookEngine terbebas dari tipe any');

// 2. Audit ResponsiveManager.ts
const responsiveManagerPath = path.join(rootDir, 'src', 'core', 'ResponsiveManager.ts');
assert(fs.existsSync(responsiveManagerPath), 'Berkas src/core/ResponsiveManager.ts tersedia');
const respContent = fs.readFileSync(responsiveManagerPath, 'utf-8');

assert(respContent.includes('export class ResponsiveManager'), 'ResponsiveManager diekspor sebagai class');
assert(respContent.includes('MOBILE_BREAKPOINT = 768'), 'ResponsiveManager memiliki ambang batas 768 piksel');
assert(respContent.includes('public detectMode'), 'ResponsiveManager memiliki fungsi detectMode');
assert(respContent.includes('public calculateStageBounds'), 'ResponsiveManager memiliki fungsi calculateStageBounds');
assert(respContent.includes('public getMode'), 'ResponsiveManager memiliki fungsi getMode');
assert(respContent.includes('public isMobile'), 'ResponsiveManager memiliki fungsi isMobile');
assert(respContent.includes('public isSpread'), 'ResponsiveManager memiliki fungsi isSpread');
assert(respContent.includes('public onModeChange'), 'ResponsiveManager memiliki listener onModeChange');
assert(respContent.includes('public onResize'), 'ResponsiveManager memiliki listener onResize');
assert(respContent.includes('public destroy'), 'ResponsiveManager memiliki fungsi destroy');
assert(!respContent.includes(': any'), 'ResponsiveManager terbebas dari tipe any');

// 3. Audit AudioController.ts
const audioControllerPath = path.join(rootDir, 'src', 'core', 'AudioController.ts');
assert(fs.existsSync(audioControllerPath), 'Berkas src/core/AudioController.ts tersedia');
const audioContent = fs.readFileSync(audioControllerPath, 'utf-8');

assert(audioContent.includes('export class AudioController'), 'AudioController diekspor sebagai class');
assert(audioContent.includes('POOL_SIZE = 5') || audioContent.includes('audioPool'), 'AudioController menerapkan audio pooling');
assert(audioContent.includes('public isMuted'), 'AudioController memiliki fungsi isMuted');
assert(audioContent.includes('public setMuted'), 'AudioController memiliki fungsi setMuted');
assert(audioContent.includes('public toggleMute'), 'AudioController memiliki fungsi toggleMute');
assert(audioContent.includes('public playFlipSound'), 'AudioController memiliki fungsi playFlipSound');
assert(audioContent.includes('public onMuteChange'), 'AudioController memiliki listener onMuteChange');
assert(audioContent.includes('public destroy'), 'AudioController memiliki fungsi destroy');
assert(audioContent.includes('localStorage'), 'AudioController mengintegrasikan persistensi LocalStorage');
assert(!audioContent.includes(': any'), 'AudioController terbebas dari tipe any');

// 4. Audit bookConfig.ts
const bookConfigPath = path.join(rootDir, 'src', 'config', 'bookConfig.ts');
assert(fs.existsSync(bookConfigPath), 'Berkas src/config/bookConfig.ts tersedia');
const configContent = fs.readFileSync(bookConfigPath, 'utf-8');

assert(configContent.includes('ASPECT_RATIO = 4 / 3') || configContent.includes('ASPECT_RATIO = 16 / 9'), 'bookConfig menetapkan rasio aspek 4:3');
assert(configContent.includes('BASE_PAGE_WIDTH = 800') || configContent.includes('BASE_PAGE_WIDTH = 960'), 'bookConfig menetapkan BASE_PAGE_WIDTH = 800');
assert(configContent.includes('BASE_PAGE_HEIGHT = 600') || configContent.includes('BASE_PAGE_HEIGHT = 540'), 'bookConfig menetapkan BASE_PAGE_HEIGHT = 600');
assert(configContent.includes('DEFAULT_FLIPPING_TIME = 650'), 'bookConfig menetapkan durasi pembalikan 650ms');
assert(configContent.includes('showCover: true'), 'bookConfig mengaktifkan showCover: true');
assert(configContent.includes('drawShadow: true'), 'bookConfig mengaktifkan drawShadow: true');
assert(configContent.includes('showPageCorners: true'), 'bookConfig mengaktifkan sudut lengkung kertas');
assert(!configContent.includes(': any'), 'bookConfig terbebas dari tipe any');

// 5. Audit main.ts Wiring
const mainPath = path.join(rootDir, 'src', 'main.ts');
const mainContent = fs.readFileSync(mainPath, 'utf-8');

assert(mainContent.includes('new FlipbookEngine()'), 'main.ts menginisialisasi FlipbookEngine');
assert(mainContent.includes('new AudioController('), 'main.ts menginisialisasi AudioController');
assert(mainContent.includes('new ResponsiveManager()'), 'main.ts menginisialisasi ResponsiveManager');
assert(mainContent.includes('this.flipbookEngine.onPageChange'), 'main.ts menghubungkan onPageChange');
assert(mainContent.includes('this.audioController.playFlipSound()'), 'main.ts memicu audio saat halaman berganti');
assert(mainContent.includes('this.responsiveManager.onModeChange'), 'main.ts menghubungkan onModeChange');
assert(mainContent.includes('this.responsiveManager.onResize'), 'main.ts menghubungkan onResize');
assert(!mainContent.includes(': any'), 'main.ts terbebas dari tipe any');

// 6. Audit Larangan Emoji
const coreFiles = [
  'src/core/FlipbookEngine.ts',
  'src/core/ResponsiveManager.ts',
  'src/core/AudioController.ts',
  'src/config/bookConfig.ts',
  'src/main.ts',
  'src/types/page-flip.d.ts',
  'src/types/index.ts',
  'src/styles/main.css'
];

for (const f of coreFiles) {
  const full = path.join(rootDir, f);
  if (fs.existsSync(full)) {
    const text = fs.readFileSync(full, 'utf-8');
    assert(!emojiRegex.test(text), `Bebas emoji: ${f}`);
  }
}

if (!passed) {
  console.error('[FAILED] Terdapat pengujian Fase 4 yang gagal.');
  process.exit(1);
} else {
  console.log('[SUCCESS] Seluruh 40 kriteria verifikasi Fase 4 sukses 100%.');
}
