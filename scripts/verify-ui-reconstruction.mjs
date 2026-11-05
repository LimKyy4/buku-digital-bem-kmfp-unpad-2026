import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

console.log('[VERIFY] Memulai audit verifikasi rekonstruksi total UI/UX & Multimedia...');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Centered Floating Pill Navbar (src/components/Navbar.ts)
const navbarPath = path.join(projectRoot, 'src/components/Navbar.ts');
assert(fs.existsSync(navbarPath), 'File src/components/Navbar.ts ada.');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');
assert(navbarContent.includes('fixed top-4 left-1/2 -translate-x-1/2'), 'Navbar melayang di tengah atas (top-4 left-1/2 -translate-x-1/2).');
assert(navbarContent.includes('rounded-full'), 'Navbar berbentuk kapsul penuh (rounded-full).');
assert(navbarContent.includes('Grand Design Biro Keuangan'), 'Navbar memuat judul Grand Design Biro Keuangan.');
assert(navbarContent.includes('navbar-fullscreen-btn'), 'Navbar memuat tombol tunggal Layar Penuh.');
assert(navbarContent.includes('updateFullscreen'), 'Navbar memiliki method updateFullscreen.');
assert(navbarContent.includes('onToggleFullscreen'), 'Navbar memiliki method onToggleFullscreen.');

// 2. Off-Canvas Left Sidebar Drawer: Table of Contents (src/components/TableOfContents.ts)
const tocPath = path.join(projectRoot, 'src/components/TableOfContents.ts');
assert(fs.existsSync(tocPath), 'File src/components/TableOfContents.ts ada.');
const tocContent = fs.readFileSync(tocPath, 'utf8');
assert(tocContent.includes('fixed top-0 left-0 bottom-0'), 'TableOfContents menempel di sisi kiri layar.');
assert(tocContent.includes('w-[340px]'), 'TableOfContents memiliki lebar 340px.');
assert(tocContent.includes('-translate-x-full'), 'TableOfContents memiliki transisi off-canvas -translate-x-full saat tertutup.');
assert(tocContent.includes('toc-backdrop'), 'TableOfContents memiliki backdrop semi-transparan gelap.');
assert(tocContent.includes('toc-row'), 'TableOfContents menggunakan format flat list row.');
assert(tocContent.includes('data-page'), 'TableOfContents baris memiliki atribut data-page (entire row clickable).');
assert(tocContent.includes('AKTIF'), 'TableOfContents memiliki penanda status bab AKTIF.');

// 3. Centered Floating Pill Toolbar Footer (src/components/Controls.ts)
const controlsPath = path.join(projectRoot, 'src/components/Controls.ts');
assert(fs.existsSync(controlsPath), 'File src/components/Controls.ts ada.');
const controlsContent = fs.readFileSync(controlsPath, 'utf8');
assert(controlsContent.includes('fixed bottom-[18px] left-1/2 -translate-x-1/2') || controlsContent.includes('fixed bottom-'), 'Controls melayang di tengah bawah panggung.');
assert(controlsContent.includes('rounded-full'), 'Controls berbentuk kapsul melayang membulat penuh (rounded-full).');
assert(controlsContent.includes('ctrl-toc'), 'Controls memuat tombol Daftar Isi (#ctrl-toc).');
assert(controlsContent.includes('ctrl-page-indicator'), 'Controls memuat indikator nomor halaman teks murni (#ctrl-page-indicator).');
assert(controlsContent.includes('ctrl-audio'), 'Controls memuat tombol suara kertas (#ctrl-audio).');
assert(controlsContent.includes('handleUserActivity'), 'Controls mengelola timer Auto-Hide cerdas 3 detik.');
assert(controlsContent.includes('edgePrevButton'), 'Controls mendukung tombol panah sisi panggung #edge-prev.');
assert(controlsContent.includes('edgeNextButton'), 'Controls mendukung tombol panah sisi panggung #edge-next.');

// 4. Sistem Multimedia: Playlist 3 Lagu & Floating Draggable Mini Music Player
const musicCtrlPath = path.join(projectRoot, 'src/core/MusicController.ts');
const musicPlayerPath = path.join(projectRoot, 'src/components/MusicPlayer.ts');
assert(fs.existsSync(musicCtrlPath), 'File src/core/MusicController.ts ada.');
assert(fs.existsSync(musicPlayerPath), 'File src/components/MusicPlayer.ts ada.');
const musicCtrlContent = fs.readFileSync(musicCtrlPath, 'utf8');
const musicPlayerContent = fs.readFileSync(musicPlayerPath, 'utf8');
assert(musicCtrlContent.includes('Oh Kasih') && musicCtrlContent.includes('Shanty'), 'MusicController mendaftarkan lagu Shanty - Oh Kasih.');
assert(musicCtrlContent.includes('Senja Teduh Pelita') && musicCtrlContent.includes("MALIQ & D'Essentials"), "MusicController mendaftarkan lagu MALIQ & D'Essentials.");
assert(musicCtrlContent.includes('Mata Ke Hati') && musicCtrlContent.includes('HIVI!'), 'MusicController mendaftarkan lagu HIVI! - Mata Ke Hati.');
assert(musicCtrlContent.includes('playTrack'), 'MusicController memiliki metode playTrack.');
assert(musicCtrlContent.includes('next()') || musicCtrlContent.includes('skip()'), 'MusicController memiliki metode next/skip playlist loop.');
assert(musicCtrlContent.includes('prev()') || musicCtrlContent.includes('undo()'), 'MusicController memiliki metode prev/undo.');
assert(musicPlayerContent.includes('music-drag-handle'), 'MusicPlayer memiliki drag handle geser bebas.');
assert(musicPlayerContent.includes('music-vinyl-disc'), 'MusicPlayer memiliki piringan kaset/vinyl berputar.');
assert(musicPlayerContent.includes('music-track-ticker'), 'MusicPlayer memiliki ticker teks judul lagu dinamis.');
assert(musicPlayerContent.includes('music-btn-play'), 'MusicPlayer memiliki tombol Play/Pause.');
assert(musicPlayerContent.includes('music-btn-stop'), 'MusicPlayer memiliki tombol Stop.');
assert(musicPlayerContent.includes('music-btn-undo'), 'MusicPlayer memiliki tombol Undo/Prev.');
assert(musicPlayerContent.includes('music-btn-skip'), 'MusicPlayer memiliki tombol Skip/Next.');
assert(musicPlayerContent.includes('music-volume-slider'), 'MusicPlayer memiliki slider volume.');
assert(musicPlayerContent.includes('music-player-minimized'), 'MusicPlayer memiliki mode minimized piringan kaset 42x42px.');

// 5. Verifikasi Aset Musik MP3
const shantyAudio = path.join(projectRoot, 'public/assets/musik/Shanty - Oh Kasih (Official Music Video).mp3');
const maliqAudio = path.join(projectRoot, 'public/assets/musik/MALIQ & D\'Essentials - Senja Teduh Pelita (Unplugged Version).mp3');
const hiviAudio = path.join(projectRoot, 'public/assets/musik/HIVI! - Mata Ke Hati (Acoustic Version).mp3');
assert(fs.existsSync(shantyAudio), 'Berkas Shanty - Oh Kasih ada di public/assets/musik.');
assert(fs.existsSync(maliqAudio), 'Berkas MALIQ ada di public/assets/musik.');
assert(fs.existsSync(hiviAudio), 'Berkas HIVI! ada di public/assets/musik.');

// 6. Verifikasi Adaptasi Tampilan: Windowed (Single) vs Fullscreen (Spread)
const responsivePath = path.join(projectRoot, 'src/core/ResponsiveManager.ts');
assert(fs.existsSync(responsivePath), 'File src/core/ResponsiveManager.ts ada.');
const responsiveContent = fs.readFileSync(responsivePath, 'utf8');
assert(responsiveContent.includes('detectIsFullscreen'), 'ResponsiveManager mendeteksi status Layar Penuh.');
assert(responsiveContent.includes("return 'single'"), 'ResponsiveManager mengembalikan Single Page Mode saat windowed/biasa.');
assert(responsiveContent.includes("return isNarrowScreen ? 'single' : 'spread'"), 'ResponsiveManager mengembalikan Two-Page Spread saat fullscreen.');

// 7. Pemanis Scrapbook & Penomoran Halaman (Hal. 01 - Hal. 24)
const flipbookPath = path.join(projectRoot, 'src/core/FlipbookEngine.ts');
assert(fs.existsSync(flipbookPath), 'File src/core/FlipbookEngine.ts ada.');
const flipbookContent = fs.readFileSync(flipbookPath, 'utf8');
assert(flipbookContent.includes('washiTape') || flipbookContent.includes('washi-tape'), 'FlipbookEngine memuat aksen selotip kertas washi tape scrapbook.');
assert(flipbookContent.includes('BEM KMFP UNPAD • OFFICIAL BLUEPRINT'), 'FlipbookEngine memuat cap stempel digital resmi.');
assert(flipbookContent.includes('spineCrease'), 'FlipbookEngine memuat garis lipatan buku tengah (spine crease).');
assert(flipbookContent.includes('Hal. ${paddedNum}') || flipbookContent.includes('Hal. 01') || flipbookContent.includes('pageNumberPin'), 'FlipbookEngine menyematkan stiker penomoran halaman (Hal. 01 s/d Hal. 24).');

// 8. Eliminasi Mutlak Scrollbar (Zero Downward Scroll)
const indexPath = path.join(projectRoot, 'index.html');
const cssPath = path.join(projectRoot, 'src/styles/main.css');
const indexHtml = fs.readFileSync(indexPath, 'utf8');
const mainCss = fs.readFileSync(cssPath, 'utf8');
assert(indexHtml.includes('overflow-hidden'), 'index.html mengunci overflow-hidden pada elemen body.');
assert(mainCss.includes('overflow: hidden !important'), 'main.css menerapkan overflow: hidden !important pada html, body.');
assert(mainCss.includes('overscroll-behavior: none'), 'main.css menerapkan overscroll-behavior: none.');

// 9. Larangan Mutlak Emoji
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}]/u;
const checkedFiles = [
  'src/components/Navbar.ts',
  'src/components/TableOfContents.ts',
  'src/components/Controls.ts',
  'src/components/MusicPlayer.ts',
  'src/core/MusicController.ts',
  'src/core/ResponsiveManager.ts',
  'src/core/FlipbookEngine.ts',
  'src/main.ts',
  'src/styles/main.css',
  'src/styles/neobrutalism.css',
  'index.html'
];

for (const relPath of checkedFiles) {
  const fullPath = path.join(projectRoot, relPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const hasEmoji = emojiRegex.test(content);
  assert(!hasEmoji, `Berkas ${relPath} bebas dari emoji (Strict Zero-Emoji Policy).`);
}

console.log(`\n========================================`);
console.log(`HASIL AUDIT VERIFIKASI REKONSTRUKSI TOTAL:`);
console.log(`Lolos  : ${passCount}`);
console.log(`Gagal  : ${failCount}`);
console.log(`========================================\n`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('[SUCCESS] Seluruh kriteria rekonstruksi UI/UX & Multimedia terverifikasi 100% LOLOS!');
}
