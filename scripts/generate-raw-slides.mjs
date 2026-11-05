import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const slidesDir = path.join(rootDir, 'raw-assets', 'slides');

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

function escapeXml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&amp;/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Membungkus teks panjang menjadi baris-baris <tspan> SVG secara proporsional
 * guna mencegah teks meluap keluar dari batas kartu (anti-overflow).
 */
function wrapText(text, x, y, maxChars = 34, lineHeight = 30, extraAttrs = '') {
  if (!text) return '';
  const words = text.split(' ');
  const lines = [];
  let cur = '';

  for (const w of words) {
    if ((cur ? cur + ' ' : '').length + w.length <= maxChars) {
      cur = (cur ? cur + ' ' : '') + w;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);

  return lines.map((l, idx) =>
    `<tspan x="${x}" y="${y + idx * lineHeight}" ${extraAttrs}>${escapeXml(l)}</tspan>`
  ).join('');
}

// ============================================================================
// HELPER KOMPONEN SOFT NEO-BRUTALISM + DIGITAL SCRAPBOOK (DREAM PALETTE)
// ============================================================================

/**
 * Kartu Neo-Brutalis dengan Solid Offset Shadow
 */
function card(x, y, w, h, bg = '#FFFFFF', rx = 18, shadow = 4) {
  return `
    <rect x="${x + shadow}" y="${y + shadow}" width="${w}" height="${h}" rx="${rx}" fill="#2D232E" />
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${bg}" stroke="#2D232E" stroke-width="2.5" />
  `;
}

/**
 * Washi Tape Geometris dengan Efek Selotip Transparan & Garis Tepi Putus-putus
 */
function washiTape(x, y, w, h = 24, angle = 0, bg = '#FFDAC1') {
  const rot = angle ? `transform="rotate(${angle} ${x + w / 2} ${y + h / 2})"` : '';
  return `
    <g ${rot} opacity="0.92">
      <rect x="${x + 2}" y="${y + 2}" width="${w}" height="${h}" fill="#2D232E" opacity="0.25" />
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}" stroke="#2D232E" stroke-width="1.4" stroke-dasharray="5,2.5" />
    </g>
  `;
}

/**
 * Aksen Bintang Berkilau 4 Titik (Inline SVG 4-Point Sparkle) - Girly Scrapbook Vibe
 */
function sparkle(cx, cy, size = 26, fill = '#2D232E') {
  const s = size / 2;
  const d = s * 0.22;
  return `
    <path d="M ${cx} ${cy - s} Q ${cx + d} ${cy - d} ${cx + s} ${cy} Q ${cx + d} ${cy + d} ${cx} ${cy + s} Q ${cx - d} ${cy + d} ${cx - s} ${cy} Q ${cx - d} ${cy - d} ${cx} ${cy - s} Z" fill="${fill}" />
  `;
}

/**
 * Stiker Tipografi (Typography Sticker) berlatar kontras dengan shadow solid
 */
function sticker(x, y, w, h, text, bg = '#FFFFFF', fontSize = 18, rx = 14) {
  return `
    <rect x="${x + 3}" y="${y + 3}" width="${w}" height="${h}" rx="${rx}" fill="#2D232E" />
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${bg}" stroke="#2D232E" stroke-width="2.2" />
    <text x="${x + w / 2}" y="${y + h / 2 + fontSize * 0.35}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="${fontSize}" font-weight="800" text-anchor="middle" letter-spacing="0.5">${escapeXml(text)}</text>
  `;
}

/**
 * Pin Lencana Geometris Bulat (Numbered Circle Badge)
 */
function badgeCircle(cx, cy, r, text, bg = '#FFF5BA') {
  return `
    <circle cx="${cx + 2}" cy="${cy + 2}" r="${r}" fill="#2D232E" />
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${bg}" stroke="#2D232E" stroke-width="2.2" />
    <text x="${cx}" y="${cy + r * 0.38}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="${r * 0.9}" font-weight="800" text-anchor="middle">${escapeXml(text)}</text>
  `;
}

/**
 * Pin Lencana Kapsul (Pill Badge)
 */
function badgePill(x, y, w, h, text, bg = '#FFF5BA', textColor = '#2D232E', fontSize = 14) {
  return `
    <rect x="${x + 2}" y="${y + 2}" width="${w}" height="${h}" rx="${h / 2}" fill="#2D232E" />
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}" stroke="#2D232E" stroke-width="2" />
    <text x="${x + w / 2}" y="${y + h / 2 + fontSize * 0.36}" fill="${textColor}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${fontSize}" font-weight="800" text-anchor="middle" letter-spacing="1">${escapeXml(text)}</text>
  `;
}

/**
 * Pin Lencana Oktagon Geometris (Octagon Badge)
 */
function badgeOctagon(cx, cy, size, text, bg = '#FFF5BA') {
  const s = size / 2;
  const d = s * 0.4;
  const pts = [
    `${cx - s + d},${cy - s}`,
    `${cx + s - d},${cy - s}`,
    `${cx + s},${cy - s + d}`,
    `${cx + s},${cy + s - d}`,
    `${cx + s - d},${cy + s}`,
    `${cx - s + d},${cy + s}`,
    `${cx - s},${cy + s - d}`,
    `${cx - s},${cy - s + d}`
  ].join(' ');

  const shadowPts = [
    `${cx - s + d + 3},${cy - s + 3}`,
    `${cx + s - d + 3},${cy - s + 3}`,
    `${cx + s + 3},${cy - s + d + 3}`,
    `${cx + s + 3},${cy + s - d + 3}`,
    `${cx + s - d + 3},${cy + s + 3}`,
    `${cx - s + d + 3},${cy + s + 3}`,
    `${cx - s + 3},${cy + s - d + 3}`,
    `${cx - s + 3},${cy - s + d + 3}`
  ].join(' ');

  return `
    <polygon points="${shadowPts}" fill="#2D232E" />
    <polygon points="${pts}" fill="${bg}" stroke="#2D232E" stroke-width="2.2" />
    <text x="${cx}" y="${cy + 5}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="13" font-weight="800" text-anchor="middle" letter-spacing="1">${escapeXml(text)}</text>
  `;
}

/**
 * Header Lembaran Buku Scrapbook
 */
function createSvgHeader(slideNum, totalSlides = 25, category = 'GRAND DESIGN 2026') {
  return `
    <!-- Top Bar -->
    <line x1="80" y1="88" x2="1840" y2="88" stroke="#2D232E" stroke-width="2.5" />
    
    <!-- Left Sticker Badge -->
    <rect x="80" y="26" width="440" height="46" rx="23" fill="#2D232E" />
    <rect x="78" y="24" width="440" height="46" rx="23" fill="#FFF5BA" stroke="#2D232E" stroke-width="2.2" />
    <circle cx="106" cy="47" r="8" fill="#FFB7B2" stroke="#2D232E" stroke-width="1.8" />
    ${sparkle(106, 47, 10, '#2D232E')}
    <text x="126" y="53" fill="#2D232E" font-family="'Syne', sans-serif" font-size="15" font-weight="800" letter-spacing="1.5">BIRO KEUANGAN BEM KMFP UNPAD</text>
    
    <!-- Right Category Pill -->
    <rect x="1442" y="26" width="400" height="46" rx="23" fill="#2D232E" />
    <rect x="1440" y="24" width="400" height="46" rx="23" fill="#FFB7B2" stroke="#2D232E" stroke-width="2.2" />
    <text x="1640" y="53" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" text-anchor="middle" letter-spacing="1.5">${escapeXml(category)} | HALAMAN ${String(slideNum).padStart(2, '0')}/${totalSlides}</text>
  `;
}

/**
 * Footer Lembaran Buku Scrapbook
 */
function createSvgFooter() {
  return `
    <!-- Bottom Line -->
    <line x1="80" y1="1005" x2="1840" y2="1005" stroke="#2D232E" stroke-width="2.5" />
    
    <!-- Left Motto -->
    <text x="80" y="1046" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="700" letter-spacing="0.5">Transparansi • Akuntabilitas • Integritas Tata Kelola Finansial Lembaga</text>
    
    <!-- Right Badge -->
    <rect x="1462" y="1015" width="380" height="46" rx="23" fill="#2D232E" />
    <rect x="1460" y="1013" width="380" height="46" rx="23" fill="#E2F0CB" stroke="#2D232E" stroke-width="2.2" />
    <text x="1650" y="1042" fill="#2D232E" font-family="'Syne', sans-serif" font-size="15" font-weight="800" text-anchor="middle" letter-spacing="1">KABINET KARYA NYATA 2026</text>
  `;
}

/**
 * Wrapper Kanvas SVG dengan Dream Canvas (#FFF0F5) & Dot Grid Texture
 */
function wrapSvg(content) {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
    <defs>
      <!-- Subtle Dot Grid Scrapbook Pattern -->
      <pattern id="dotGrid" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="14" cy="14" r="1.4" fill="#2D232E" opacity="0.08" />
      </pattern>
      <!-- Lined Memo Paper Pattern -->
      <pattern id="linedMemo" width="40" height="34" patternUnits="userSpaceOnUse">
        <line x1="0" y1="33" x2="40" y2="33" stroke="#2D232E" stroke-opacity="0.12" stroke-width="1.3" />
      </pattern>
    </defs>

    <!-- Base Canvas -->
    <rect width="1920" height="1080" fill="#FFF0F5" />
    <rect width="1920" height="1080" fill="url(#dotGrid)" />

    <!-- Main Content -->
    ${content}
  </svg>
  `;
}

// ============================================================================
// 25 PEMBANGKIT LEMBARAN SLIDE SPESIFIKASI PENUH (SOFT NEO-BRUTALISM)
// ============================================================================

const slideGenerators = [
  // 1: Cover Utama (Sampul)
  () => wrapSvg(`
    <!-- Washi Tape di Sudut Atas -->
    ${washiTape(220, 65, 170, 28, -6, '#E2F0CB')}
    ${washiTape(1530, 65, 170, 28, 6, '#FFB7B2')}

    <!-- Main Stage Frame -->
    ${card(110, 100, 1700, 880, '#FFFFFF', 32, 6)}

    <!-- Decorative Stamp Badge: EDISI 2026 -->
    <g transform="translate(1480, 150)">
      <rect x="3" y="3" width="220" height="84" rx="10" fill="#2D232E" />
      <rect x="0" y="0" width="220" height="84" rx="10" fill="#FFF5BA" stroke="#2D232E" stroke-width="2.5" stroke-dasharray="6,3" />
      <text x="110" y="36" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" text-anchor="middle" letter-spacing="2">CAP RESMI DOKUMEN</text>
      <text x="110" y="66" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800" text-anchor="middle" letter-spacing="1">EDISI 2026</text>
    </g>

    <!-- Octagon Badge: KABINET KARYA NYATA -->
    ${badgeOctagon(280, 195, 150, 'KABINET', '#FFDAC1')}
    <text x="280" y="218" fill="#2D232E" font-family="'Syne', sans-serif" font-size="12" font-weight="800" text-anchor="middle">KARYA NYATA</text>

    <!-- Top Capsule Sticker -->
    ${sticker(480, 168, 620, 52, 'DOKUMEN RESMI TATA KELOLA KEUANGAN', '#E2F0CB', 17, 26)}
    ${sparkle(450, 194, 28, '#FFB7B2')}
    ${sparkle(1130, 194, 28, '#FFF5BA')}

    <!-- Massive Typography Sticker: GRAND DESIGN BIRO KEUANGAN -->
    <g transform="translate(180, 270)">
      <rect x="6" y="6" width="1320" height="145" rx="26" fill="#2D232E" />
      <rect x="0" y="0" width="1320" height="145" rx="26" fill="#FFFFFF" stroke="#2D232E" stroke-width="3.5" />
      <text x="660" y="100" fill="#2D232E" font-family="'Syne', sans-serif" font-size="78" font-weight="800" text-anchor="middle" letter-spacing="-1">GRAND DESIGN BIRO KEUANGAN</text>
    </g>

    <!-- Ribbon Sticker: BEM KMFP UNPAD 2026 -->
    <g transform="translate(180, 445)">
      <rect x="5" y="5" width="880" height="86" rx="22" fill="#2D232E" />
      <rect x="0" y="0" width="880" height="86" rx="22" fill="#FFB7B2" stroke="#2D232E" stroke-width="3" />
      <text x="440" y="58" fill="#2D232E" font-family="'Syne', sans-serif" font-size="46" font-weight="800" text-anchor="middle" letter-spacing="2">BEM KMFP UNPAD 2026</text>
    </g>

    <line x1="180" y1="565" x2="1740" y2="565" stroke="#2D232E" stroke-width="3" />

    <!-- Subtitle Narratives in Clean Memo Cards -->
    ${card(180, 600, 1080, 210, '#FFF5BA', 22, 5)}
    <text x="220" y="655" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="26" font-weight="800">Cetak Biru Tata Kelola Kas, Penganggaran SIAT &amp; Akuntabilitas Finansial</text>
    <text x="220" y="705" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="600">Badan Eksekutif Mahasiswa Keluarga Mahasiswa Fakultas Pertanian</text>
    <text x="220" y="750" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19">Universitas Padjadjaran Periode Kepengurusan 2026</text>

    <!-- Side Sticker Card -->
    ${card(1300, 600, 440, 210, '#FFDAC1', 22, 5)}
    ${washiTape(1400, 586, 140, 24, -2, '#FFB7B2')}
    <text x="1520" y="655" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800" text-anchor="middle">INTEGRITAS &amp; AKURASI</text>
    <text x="1520" y="705" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700" text-anchor="middle">25 Lembar Panduan Standar</text>
    <text x="1520" y="745" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" text-anchor="middle">Baku Terpadu Mahasiswa</text>

    <!-- Bottom Badge strip -->
    <g transform="translate(180, 835)">
      ${badgePill(0, 0, 260, 44, 'TRANSPARANSI KAS', '#E2F0CB', '#2D232E', 15)}
      ${badgePill(280, 0, 260, 44, 'SIAT DEKANAT CEPAT', '#FFDAC1', '#2D232E', 15)}
      ${badgePill(560, 0, 280, 44, 'STANDARDISASI REIMBURSE', '#E8D7F5', '#2D232E', 15)}
      ${badgePill(860, 0, 240, 44, 'AUDIT TERBUKA', '#C7CEEA', '#2D232E', 15)}
    </g>

    ${createSvgFooter()}
  `),

  // 2: Profil Pimpinan (Polaroid Digital & Memo Card)
  () => wrapSvg(`
    ${createSvgHeader(2, 25, 'STRUKTUR PIMPINAN')}

    ${sticker(80, 115, 560, 46, 'PROFIL PIMPINAN BIRO KEUANGAN', '#FFF5BA', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Nakhoda Tata Kelola, Pengawasan Kepatuhan, dan Akuntabilitas Anggaran 2026</text>

    <!-- POLAROID 1: Kepala Biro (Calya Mei Rahmawati) tilt -1 deg -->
    <g transform="rotate(-1 520 570)">
      ${washiTape(440, 215, 170, 26, -3, '#FFDAC1')}
      ${card(80, 230, 860, 725, '#FFFFFF', 26, 5)}
      
      <!-- Polaroid Photo Area with Monogram Avatar -->
      <rect x="120" y="270" width="230" height="250" rx="18" fill="#FFB7B2" stroke="#2D232E" stroke-width="2.5" />
      <text x="235" y="415" fill="#2D232E" font-family="'Syne', sans-serif" font-size="88" font-weight="800" text-anchor="middle">CR</text>
      <rect x="140" y="475" width="190" height="30" rx="15" fill="#FFFFFF" stroke="#2D232E" stroke-width="1.8" />
      <text x="235" y="495" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="800" text-anchor="middle">NAKHODA UTAMA</text>

      <!-- Label Jabatan Kapsul -->
      ${badgePill(380, 275, 220, 40, 'KEPALA BIRO', '#FFF5BA', '#2D232E', 16)}
      
      <text x="380" y="360" fill="#2D232E" font-family="'Syne', sans-serif" font-size="38" font-weight="800">Calya Mei</text>
      <text x="380" y="410" fill="#2D232E" font-family="'Syne', sans-serif" font-size="38" font-weight="800">Rahmawati</text>
      <text x="380" y="455" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="700">Agroteknologi 2023</text>
      <text x="380" y="488" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">Fakultas Pertanian Universitas Padjadjaran</text>

      <line x1="120" y1="540" x2="900" y2="540" stroke="#2D232E" stroke-width="2.5" />
      
      <!-- Lined Memo Area Responsibilities -->
      <rect x="120" y="560" width="780" height="365" rx="16" fill="#FFF0F5" stroke="#2D232E" stroke-width="1.8" />
      <rect x="120" y="560" width="780" height="365" fill="url(#linedMemo)" />
      
      <text x="145" y="605" fill="#2D232E" font-family="'Syne', sans-serif" font-size="22" font-weight="800">Tanggung Jawab Strategis Kepala Biro:</text>
      <text x="145" y="650" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">1. Arah Kebijakan Anggaran</text>
      <text x="170" y="680" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">Mengarahkan kebijakan anggaran terpadu dan prioritas seluruh ormawa KMFP.</text>
      
      <text x="145" y="725" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">2. Otorisasi SIAT Dekanat</text>
      <text x="170" y="755" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">Penanggung jawab otorisasi verifikasi pengajuan SIAT Dekanat Fakultas Pertanian.</text>
      
      <text x="145" y="800" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">3. Ketahanan Kas &amp; Cadangan</text>
      <text x="170" y="830" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">Otoritas alokasi dana darurat, pinjaman modal kerja, dan cadangan kas organisasi.</text>
      
      <text x="145" y="875" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">4. Hubungan Eksternal</text>
      <text x="170" y="905" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">Penghubung utama dengan Manajer Keuangan Dekanat dan Komisi II MPM KMFP.</text>
    </g>

    <!-- POLAROID 2: Wakil Kepala Biro (Zahra Inaya Hilmi) tilt +1 deg -->
    <g transform="rotate(1 1400 570)">
      ${washiTape(1320, 215, 170, 26, 3, '#FFDAC1')}
      ${card(980, 230, 860, 725, '#FFFFFF', 26, 5)}
      
      <!-- Polaroid Photo Area with Monogram Avatar -->
      <rect x="1020" y="270" width="230" height="250" rx="18" fill="#C7CEEA" stroke="#2D232E" stroke-width="2.5" />
      <text x="1135" y="415" fill="#2D232E" font-family="'Syne', sans-serif" font-size="88" font-weight="800" text-anchor="middle">ZH</text>
      <rect x="1040" y="475" width="190" height="30" rx="15" fill="#FFFFFF" stroke="#2D232E" stroke-width="1.8" />
      <text x="1135" y="495" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="800" text-anchor="middle">OPERASIONAL KAS</text>

      <!-- Label Jabatan Kapsul -->
      ${badgePill(1280, 275, 250, 40, 'WAKIL KEPALA BIRO', '#FFF5BA', '#2D232E', 16)}
      
      <text x="1280" y="360" fill="#2D232E" font-family="'Syne', sans-serif" font-size="38" font-weight="800">Zahra Inaya</text>
      <text x="1280" y="410" fill="#2D232E" font-family="'Syne', sans-serif" font-size="38" font-weight="800">Hilmi</text>
      <text x="1280" y="455" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="700">Agribisnis 2023</text>
      <text x="1280" y="488" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">Fakultas Pertanian Universitas Padjadjaran</text>

      <line x1="1020" y1="540" x2="1800" y2="540" stroke="#2D232E" stroke-width="2.5" />
      
      <!-- Lined Memo Area Responsibilities -->
      <rect x="1020" y="560" width="780" height="365" rx="16" fill="#FFF0F5" stroke="#2D232E" stroke-width="1.8" />
      <rect x="1020" y="560" width="780" height="365" fill="url(#linedMemo)" />
      
      <text x="1045" y="605" fill="#2D232E" font-family="'Syne', sans-serif" font-size="22" font-weight="800">Tanggung Jawab Operasional Wakil:</text>
      <text x="1045" y="650" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">1. Koordinasi &amp; Pembinaan Staf</text>
      <text x="1070" y="680" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">Koordinasi harian 7 staf pelaksana dan pendampingan bendahara departemen.</text>
      
      <text x="1045" y="725" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">2. Rekonsiliasi Buku Kas Harian</text>
      <text x="1070" y="755" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">Rekonsiliasi mutasi kas harian, validasi rekening bank BEM, dan kontrol kuitansi fisik.</text>
      
      <text x="1045" y="800" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">3. Pengawasan Jadwal LPJ</text>
      <text x="1070" y="830" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">Pengawasan ketepatan waktu pelaporan pertanggungjawaban (maksimal H+14 acara).</text>
      
      <text x="1045" y="875" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">4. Penyiapan Laporan Triwulan</text>
      <text x="1070" y="905" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">Kompilasi berkas laporan keuangan periodik untuk publikasi infografis terbuka.</text>
    </g>

    ${createSvgFooter()}
  `),

  // 3: Jajaran Staf (Grid 7 Memo Cards Lavender & Blue + Badges)
  () => wrapSvg(`
    ${createSvgHeader(3, 25, 'STRUKTUR ORGANISASI')}

    ${sticker(80, 115, 520, 46, 'JAJARAN STAF BIRO KEUANGAN', '#E8D7F5', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">7 Staf Eksekutor Handal Penggerak Tata Kelola Administrasi dan Kas 2026</text>

    <!-- 7 Staff Cards Grid: Row 1 (4 Staff) & Row 2 (3 Staff) -->
    <!-- ROW 1: 4 Cards -->
    ${[
      { no: '01', name: 'Amara', role: 'Administrasi &amp; Verifikasi', desc: 'Validasi kelengkapan kuitansi, nota sah, dan kepatuhan format belanja.', x: 80, y: 220, w: 420, h: 230, bg: '#E8D7F5' },
      { no: '02', name: 'Muti', role: 'Bendahara Operasional', desc: 'Pencatatan mutasi kas harian, verifikasi rekening, dan kas operasional.', x: 525, y: 220, w: 420, h: 230, bg: '#C7CEEA' },
      { no: '03', name: 'Intan', role: 'Rekonsiliasi &amp; Pelaporan', desc: 'Penyusunan neraca kas, jurnal berkala, dan laporan triwulan MPM.', x: 970, y: 220, w: 420, h: 230, bg: '#E8D7F5' },
      { no: '04', name: 'Elvina', role: 'Pendampingan Berkas SIAT', desc: 'Konsultasi bendahara kegiatan dan pengawalan proposal ke dekanat.', x: 1415, y: 220, w: 425, h: 230, bg: '#C7CEEA' }
    ].map(s => `
      ${card(s.x, s.y, s.w, s.h, s.bg, 20, 4)}
      ${badgeCircle(s.x + 45, s.y + 45, 24, s.no, '#FFF5BA')}
      <text x="${s.x + 85}" y="${s.y + 53}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="28" font-weight="800">${s.name}</text>
      ${badgePill(s.x + 25, s.y + 85, s.w - 50, 34, s.role, '#FFFFFF', '#2D232E', 13)}
      <text x="${s.x + 25}" y="${s.y + 150}" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600">
        ${wrapText(s.desc, s.x + 25, s.y + 150, 36, 24)}
      </text>
    `).join('')}

    <!-- ROW 2: 3 Cards (Wider) -->
    ${[
      { no: '05', name: 'Rey', role: 'Monitoring Anggaran', desc: 'Pengawasan serapan dana program kerja dan mitigasi defisit belanja kegiatan ormawa.', x: 80, y: 475, w: 565, h: 230, bg: '#C7CEEA' },
      { no: '06', name: 'Epe', role: 'Logistik &amp; Pencairan', desc: 'Fasilitasi penyaluran dana lapangan dan koordinasi vendor rekanan resmi ormawa.', x: 675, y: 475, w: 565, h: 230, bg: '#E8D7F5' },
      { no: '07', name: 'Haikal', role: 'Digitalisasi &amp; Master Data', desc: 'Pengelolaan portal Google Cloud drive dan database keuangan daring terpadu 24/7.', x: 1270, y: 475, w: 570, h: 230, bg: '#C7CEEA' }
    ].map(s => `
      ${card(s.x, s.y, s.w, s.h, s.bg, 20, 4)}
      ${badgeCircle(s.x + 45, s.y + 45, 24, s.no, '#FFF5BA')}
      <text x="${s.x + 85}" y="${s.y + 53}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="28" font-weight="800">${s.name}</text>
      ${badgePill(s.x + 25, s.y + 85, s.w - 50, 34, s.role, '#FFFFFF', '#2D232E', 14)}
      <text x="${s.x + 25}" y="${s.y + 150}" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600">
        ${wrapText(s.desc, s.x + 25, s.y + 150, 50, 24)}
      </text>
    `).join('')}

    <!-- Bottom Notice Card -->
    ${card(80, 730, 1760, 235, '#FFF5BA', 22, 5)}
    ${washiTape(160, 716, 160, 26, -2, '#FFB7B2')}
    ${washiTape(1580, 716, 160, 26, 2, '#E2F0CB')}
    <text x="120" y="785" fill="#2D232E" font-family="'Syne', sans-serif" font-size="26" font-weight="800">SINERGI DAN SOLIDITAS 7 STAF BIRO KEUANGAN</text>
    <text x="120" y="830" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19">
      ${wrapText('Setiap staf memegang peran spesifik dengan mekanisme silang verifikasi (four-eyes principle) untuk mencegah kesalahan pencatatan dan memastikan kecepatan layanan birokrasi keuangan mahasiswa.', 120, 830, 110, 28)}
    </text>
    <rect x="120" y="890" width="700" height="42" rx="21" fill="#FFFFFF" stroke="#2D232E" stroke-width="2" />
    <text x="140" y="917" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="800">Standar Pelayanan: Respon cepat verifikasi berkas dan nota maksimal 2x24 jam kerja.</text>

    ${createSvgFooter()}
  `),

  // 4: Visi dan Misi (Card Pink Besar + 3 Cascading Cards Mint + Badges 01, 02, 03)
  () => wrapSvg(`
    ${createSvgHeader(4, 25, 'HALUAN STRATEGIS')}

    ${sticker(80, 115, 500, 46, 'VISI DAN MISI BIRO KEUANGAN', '#FFB7B2', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Arah Kompas Pergerakan Tata Finansial BEM KMFP UNPAD 2026</text>

    <!-- Blok Visi: Kartu Memo Besar Dream Pink -->
    ${card(80, 225, 1760, 275, '#FFB7B2', 26, 5)}
    ${washiTape(140, 212, 170, 26, -2, '#FFF5BA')}
    ${badgePill(130, 255, 160, 40, 'VISI 2026', '#FFFFFF', '#2D232E', 16)}
    
    <text x="130" y="340" fill="#2D232E" font-family="'Syne', sans-serif" font-size="34" font-weight="800">&quot;Mewujudkan Tata Kelola Keuangan BEM KMFP UNPAD yang Profesional, Transparan,</text>
    <text x="130" y="390" fill="#2D232E" font-family="'Syne', sans-serif" font-size="34" font-weight="800">Akuntabel, dan Solutif Berbasis Kolaborasi Digital Terintegrasi&quot;</text>
    
    <!-- 4 Value Pills inside Visi -->
    <g transform="translate(130, 430)">
      ${badgePill(0, 0, 170, 36, 'PROFESIONAL', '#FFFFFF', '#2D232E', 14)}
      ${badgePill(190, 0, 170, 36, 'TRANSPARAN', '#FFF5BA', '#2D232E', 14)}
      ${badgePill(380, 0, 160, 36, 'AKUNTABEL', '#E2F0CB', '#2D232E', 14)}
      ${badgePill(560, 0, 140, 36, 'SOLUTIF', '#FFDAC1', '#2D232E', 14)}
      <text x="730" y="24" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600">Landasan filosofis pembaharuan tata kelola dana kemahasiswaan KMFP.</text>
    </g>

    <!-- 3 Cascading Cards Misi Warna Dream Mint -->
    ${[
      {
        no: '01',
        title: 'Standarisasi SOP Keuangan',
        desc: 'Menyusun alur birokrasi permohonan, pencairan, dan LPJ yang baku, transparan, dan mudah dipahami oleh seluruh ormawa.',
        actions: ['SOP Satu Pintu Terpadu', 'Format Kuitansi Bermeterai', 'SLA Verifikasi &lt; 48 Jam'],
        x: 80, y: 530, w: 560, h: 430
      },
      {
        no: '02',
        title: 'Digitalisasi &amp; Sentralisasi Data',
        desc: 'Menghadirkan Master Data Keuangan daring yang real-time, terstruktur rapi, dan terverifikasi aman melalui Google Cloud.',
        actions: ['Cloud Drive 24/7 Terbuka', 'Rekonsiliasi Mutasi Harian', 'Template RAB Daring 8 Kolom'],
        x: 680, y: 530, w: 560, h: 430
      },
      {
        no: '03',
        title: 'Pendampingan &amp; Audit Terbuka',
        desc: 'Memberikan asistensi solutif intensif bagi bendahara departemen serta publikasi laporan keuangan berkala untuk merawat kepercayaan publik.',
        actions: ['Klinik Bimtek Bendahara', 'Laporan Kas Terbuka Triwulan', 'Pendampingan Input SIAT'],
        x: 1280, y: 530, w: 560, h: 430
      }
    ].map(m => `
      ${card(m.x, m.y, m.w, m.h, '#E2F0CB', 24, 4)}
      ${washiTape(m.x + m.w - 160, m.y - 10, 140, 24, 2, '#FFDAC1')}
      ${badgeCircle(m.x + 60, m.y + 60, 32, m.no, '#FFF5BA')}
      <text x="${m.x + 110}" y="${m.y + 68}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">MISI ${m.no}</text>
      
      <text x="${m.x + 40}" y="${m.y + 130}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="26" font-weight="800">${m.title}</text>
      <line x1="${m.x + 40}" y1="${m.y + 155}" x2="${m.x + m.w - 40}" y2="${m.y + 155}" stroke="#2D232E" stroke-width="2" />
      
      <text x="${m.x + 40}" y="${m.y + 195}" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="500">
        ${wrapText(m.desc, m.x + 40, m.y + 195, 38, 26)}
      </text>

      <!-- Key Action Checkpoints -->
      <g transform="translate(${m.x + 40}, ${m.y + 290})">
        <rect x="0" y="0" width="${m.w - 80}" height="115" rx="14" fill="#FFFFFF" stroke="#2D232E" stroke-width="1.8" />
        <text x="20" y="30" fill="#2D232E" font-family="'Syne', sans-serif" font-size="14" font-weight="800">FOKUS AKSI STRATEGIS:</text>
        ${m.actions.map((act, i) => `
          <circle cx="28" cy="${56 + i * 24}" r="4" fill="#2D232E" />
          <text x="42" y="${61 + i * 24}" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="700">${act}</text>
        `).join('')}
      </g>
    `).join('')}

    ${createSvgFooter()}
  `),

  // 5: Diagram The Golden Circle (3 Lingkaran Konsentris: WHY #FFB7B2, HOW #FFF5BA, WHAT #C7CEEA)
  () => wrapSvg(`
    ${createSvgHeader(5, 25, 'KERANGKA BERPIKIR')}

    ${sticker(80, 115, 520, 46, 'DIAGRAM THE GOLDEN CIRCLE', '#FFDAC1', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Kerangka Simon Sinek: Menemukan Inti Gerakan Finansial Organisasi 2026</text>

    <!-- Left Arena: 3 Concentric Circles with 2.5px solid #2D232E border -->
    <g transform="translate(480, 580)">
      <!-- Outer WHAT: #C7CEEA -->
      <circle cx="5" cy="5" r="340" fill="#2D232E" />
      <circle cx="0" cy="0" r="340" fill="#C7CEEA" stroke="#2D232E" stroke-width="3" />
      
      <!-- Middle HOW: #FFF5BA -->
      <circle cx="5" cy="5" r="235" fill="#2D232E" />
      <circle cx="0" cy="0" r="235" fill="#FFF5BA" stroke="#2D232E" stroke-width="3" />

      <!-- Inner WHY: #FFB7B2 -->
      <circle cx="5" cy="5" r="130" fill="#2D232E" />
      <circle cx="0" cy="0" r="130" fill="#FFB7B2" stroke="#2D232E" stroke-width="3" />

      <!-- Typography Labels -->
      <text x="0" y="-260" fill="#2D232E" font-family="'Syne', sans-serif" font-size="30" font-weight="800" text-anchor="middle">WHAT (PRODUK)</text>
      <text x="0" y="-155" fill="#2D232E" font-family="'Syne', sans-serif" font-size="30" font-weight="800" text-anchor="middle">HOW (METODE)</text>
      <text x="0" y="8" fill="#2D232E" font-family="'Syne', sans-serif" font-size="40" font-weight="800" text-anchor="middle">WHY</text>
      <text x="0" y="46" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" text-anchor="middle">(NILAI MORAL)</text>
    </g>

    <!-- Right Side Explanatory Memo Cards -->
    <g transform="translate(890, 220)">
      <!-- WHY Card -->
      ${card(0, 0, 950, 225, '#FFB7B2', 22, 5)}
      ${badgePill(35, 22, 130, 36, '1. WHY', '#FFFFFF', '#2D232E', 15)}
      <text x="185" y="47" fill="#2D232E" font-family="'Syne', sans-serif" font-size="26" font-weight="800">Alasan Keberadaan &amp; Fondasi Integritas</text>
      <text x="35" y="95" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="500">
        ${wrapText('Biro Keuangan hadir bukan sekadar juru bayar administratif, melainkan benteng pertahanan integritas moral dan perawat amanah dana publik sivitas mahasiswa KMFP.', 35, 95, 66, 28)}
      </text>

      <!-- HOW Card -->
      ${card(0, 255, 950, 225, '#FFF5BA', 22, 5)}
      ${badgePill(35, 277, 130, 36, '2. HOW', '#FFFFFF', '#2D232E', 15)}
      <text x="185" y="302" fill="#2D232E" font-family="'Syne', sans-serif" font-size="26" font-weight="800">Metodologi &amp; Mekanisme Terpadu</text>
      <text x="35" y="350" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="500">
        ${wrapText('Mewujudkan tata kelola melalui standarisasi SOP satu pintu, sistem verifikasi berimbang (four-eyes), serta pendampingan proaktif bagi seluruh bendahara ormawa.', 35, 350, 66, 28)}
      </text>

      <!-- WHAT Card -->
      ${card(0, 510, 950, 225, '#C7CEEA', 22, 5)}
      ${badgePill(35, 532, 130, 36, '3. WHAT', '#FFFFFF', '#2D232E', 15)}
      <text x="185" y="557" fill="#2D232E" font-family="'Syne', sans-serif" font-size="26" font-weight="800">Produk Nyata &amp; Keluaran Layanan</text>
      <text x="35" y="605" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="500">
        ${wrapText('Output konkret berupa ketepatan pencairan SIAT 100%, publikasi laporan kas terbuka secara berkala, dan penyediaan Master Data Keuangan berbasis cloud.', 35, 605, 66, 28)}
      </text>
    </g>

    ${createSvgFooter()}
  `),

  // 6: Uraian Golden Circle (Why & How)
  () => wrapSvg(`
    ${createSvgHeader(6, 25, 'BEDAH GOLDEN CIRCLE')}

    ${sticker(80, 115, 540, 46, 'THE GOLDEN CIRCLE: WHY &amp; HOW', '#FFF5BA', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Dua Pilar Awal Penentu Keteguhan Nilai Moral dan Metode Operasional</text>

    <!-- Card WHY in Lined Paper Style with Washi Tape -->
    <g transform="translate(80, 220)">
      ${washiTape(60, -10, 150, 24, -2, '#FFB7B2')}
      ${card(0, 0, 850, 740, '#FFDAC1', 26, 5)}
      <rect x="30" y="30" width="790" height="680" rx="18" fill="#FFFFFF" stroke="#2D232E" stroke-width="1.8" />
      <rect x="30" y="30" width="790" height="680" fill="url(#linedMemo)" />
      
      ${badgePill(50, 50, 180, 40, 'WHY (NILAI)', '#FFB7B2', '#2D232E', 16)}
      <text x="50" y="135" fill="#2D232E" font-family="'Syne', sans-serif" font-size="34" font-weight="800">Menjaga Marwah Amanah</text>
      <text x="50" y="180" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="600">
        ${wrapText('"Keuangan bukan sekadar hitungan angka rupiah, tetapi representasi komitmen moral pengurus kepada sivitas mahasiswa."', 50, 180, 46, 28)}
      </text>

      <line x1="50" y1="265" x2="790" y2="265" stroke="#2D232E" stroke-width="2" />
      
      <text x="50" y="310" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">Tiga Prinsip Fundamental WHY:</text>
      
      <text x="50" y="360" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">1. Akuntabilitas Mutlak</text>
      <text x="50" y="395" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
        ${wrapText('Setiap rupiah anggaran wajib dipertanggungjawabkan secara sah dengan kuitansi resmi, mutasi bank, dan audit terbuka.', 50, 395, 48, 26)}
      </text>

      <text x="50" y="475" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">2. Keadilan Distribusi</text>
      <text x="50" y="510" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
        ${wrapText('Alokasi pagu proporsional sesuai kebutuhan riil seluruh departemen dan himpunan mahasiswa tanpa diskriminasi.', 50, 510, 48, 26)}
      </text>

      <text x="50" y="590" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">3. Ketahanan Kas</text>
      <text x="50" y="625" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
        ${wrapText('Mencegah terjadinya defisit kas pada program kerja strategis kabinet 2026 dengan sistem cadangan dana darurat.', 50, 625, 48, 26)}
      </text>
    </g>

    <!-- Card HOW in Lined Paper Style with Washi Tape -->
    <g transform="translate(980, 220)">
      ${washiTape(60, -10, 150, 24, 2, '#E2F0CB')}
      ${card(0, 0, 860, 740, '#E2F0CB', 26, 5)}
      <rect x="30" y="30" width="800" height="680" rx="18" fill="#FFFFFF" stroke="#2D232E" stroke-width="1.8" />
      <rect x="30" y="30" width="800" height="680" fill="url(#linedMemo)" />
      
      ${badgePill(50, 50, 180, 40, 'HOW (METODE)', '#E2F0CB', '#2D232E', 16)}
      <text x="50" y="135" fill="#2D232E" font-family="'Syne', sans-serif" font-size="34" font-weight="800">Tata Kelola Profesional</text>
      <text x="50" y="180" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="600">
        ${wrapText('"Membangun infrastruktur administrasi yang presisi, transparan, dan ramah pengguna melalui simplifikasi alur birokrasi."', 50, 180, 46, 28)}
      </text>

      <line x1="50" y1="265" x2="800" y2="265" stroke="#2D232E" stroke-width="2" />
      
      <text x="50" y="310" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">Tiga Mekanisme Operasional HOW:</text>
      
      <text x="50" y="360" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">1. SOP Satu Pintu</text>
      <text x="50" y="395" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
        ${wrapText('Standarisasi format proposal, SPPD, dan permohonan dana terintegrasi via portal tunggal.', 50, 395, 48, 26)}
      </text>

      <text x="50" y="475" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">2. Four-Eyes Verification</text>
      <text x="50" y="510" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
        ${wrapText('Verifikasi silang berimbang antara staf pemeriksa dan Wakil Kepala Biro sebelum persetujuan akhir.', 50, 510, 48, 26)}
      </text>

      <text x="50" y="590" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">3. Pendampingan Proaktif</text>
      <text x="50" y="625" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
        ${wrapText('Bimbingan teknis intensif kepada bendahara kepanitiaan sebelum deadline pengajuan ke Dekanat.', 50, 625, 48, 26)}
      </text>
    </g>

    ${createSvgFooter()}
  `),

  // 7: Uraian Golden Circle (What)
  () => wrapSvg(`
    ${createSvgHeader(7, 25, 'BEDAH GOLDEN CIRCLE')}

    ${sticker(80, 115, 500, 46, 'THE GOLDEN CIRCLE: WHAT', '#C7CEEA', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Hasil Nyata, Output Terukur, dan Produk Layanan Biro Keuangan</text>

    <!-- 4 Output Cards with washi tape clips -->
    ${[
      { code: 'OUT-01', title: 'Ketepatan Pencairan SIAT 100%', val: 'Target 0 Keterlambatan', desc: 'Seluruh berkas pencairan dana Dekanat Fakultas Pertanian tuntas sesuai kalender kegiatan tanpa jeda birokrasi.', metrics: 'Target Waktu: Maks H-3 Acara', color: '#FFB7B2', tape: '#E2F0CB' },
      { code: 'OUT-02', title: 'Master Data Finansial Cloud', val: 'Akses Real-Time 24/7', desc: 'Portal arsip terpusat bit.ly/MASTERDATABIROKEUANGAN siap diakses pengurus untuk seluruh template formulir resmi.', metrics: 'Infrastruktur: Google Workspace Cloud', color: '#FFF5BA', tape: '#FFDAC1' },
      { code: 'OUT-03', title: 'Workshop Edukasi Bendahara', val: '100% Bendahara Terlatih', desc: 'Pelatihan intensif pembuatan RAB, pengumpulan nota sah bermeterai, dan teknik perakitan LPJ standar dekanat.', metrics: 'Frekuensi: 2 Kali per Periode', color: '#FFDAC1', tape: '#FFB7B2' },
      { code: 'OUT-04', title: 'Laporan Kas Publik Triwulan', val: 'Publikasi Terbuka Sivitas', desc: 'Rilis infografis transparansi arus kas BEM secara terbuka ke media sosial resmi dan pelaporan paripurna ke MPM.', metrics: 'Kanal: Instagram &amp; Media Komunikasi', color: '#E8D7F5', tape: '#FFF5BA' }
    ].map((item, idx) => {
      const cx = 80 + (idx % 2) * 890;
      const cy = 230 + Math.floor(idx / 2) * 365;
      return `
        <g transform="translate(${cx}, ${cy})">
          ${washiTape(40, -10, 140, 24, (idx % 2 === 0 ? -2 : 2), item.tape)}
          ${card(0, 0, 860, 335, item.color, 24, 5)}
          ${badgePill(35, 30, 130, 34, item.code, '#FFFFFF', '#2D232E', 15)}
          <text x="35" y="105" fill="#2D232E" font-family="'Syne', sans-serif" font-size="30" font-weight="800">${item.title}</text>
          
          <rect x="35" y="125" width="380" height="42" rx="12" fill="#FFFFFF" stroke="#2D232E" stroke-width="2" />
          <text x="50" y="153" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="800">${item.val}</text>
          
          <line x1="35" y1="190" x2="820" y2="190" stroke="#2D232E" stroke-width="1.8" />
          <text x="35" y="235" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
            ${wrapText(item.desc, 35, 235, 52, 26)}
          </text>
          <text x="35" y="305" fill="#2D232E" font-family="'Syne', sans-serif" font-size="16" font-weight="800">${item.metrics}</text>
        </g>
      `;
    }).join('')}

    ${createSvgFooter()}
  `),

  // 8: Deskripsi Umum Bikeu
  () => wrapSvg(`
    ${createSvgHeader(8, 25, 'PROFIL BIRO')}

    ${sticker(80, 115, 540, 46, 'DESKRIPSI UMUM BIRO KEUANGAN', '#FFF5BA', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Peran Sentral, Posisi Strategis, dan Ekosistem Finansial BEM KMFP UNPAD</text>

    <!-- Main Overview Card -->
    ${card(80, 220, 1120, 740, '#FFFFFF', 26, 5)}
    ${washiTape(140, 208, 160, 26, -2, '#FFB7B2')}
    <text x="130" y="295" fill="#2D232E" font-family="'Syne', sans-serif" font-size="36" font-weight="800">Sentralisasi &amp; Akselerasi Finansial</text>
    <text x="130" y="345" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="500">
      ${wrapText('Biro Keuangan (Bikeu) merupakan badan penunjang eksekutif yang memegang mandat penuh dalam orkestrasi anggaran, penjagaan likuiditas kas, serta verifikasi seluruh transaksi finansial BEM KMFP UNPAD.', 130, 345, 62, 28)}
    </text>

    <line x1="130" y1="435" x2="1140" y2="435" stroke="#2D232E" stroke-width="2" />
    
    <text x="130" y="480" fill="#2D232E" font-family="'Syne', sans-serif" font-size="26" font-weight="800">4 Fokus Strategis Tahun 2026:</text>
    ${[
      { t: '1. Tertib Administrasi', d: 'Pengarsipan digital ganda untuk setiap bukti transaksi kuitansi dan faktur belanja.' },
      { t: '2. Responsif terhadap Ormawa', d: 'Menjadi konsultan keuangan bersahabat bagi seluruh himpunan dan departemen.' },
      { t: '3. Kecepatan Birokrasi Dekanat', d: 'Penghubung aktif dan solutif antara pengurus ormawa dan Manajer Keuangan Fakultas.' },
      { t: '4. Zero Deficit Guarantee', d: 'Analisis kelayakan anggaran secara ketat sebelum pelaksanaan kegiatan disetujui.' }
    ].map((f, i) => `
      <rect x="130" y="${515 + i * 105}" width="1020" height="88" rx="16" fill="#FFF0F5" stroke="#2D232E" stroke-width="1.8" />
      <text x="160" y="${552 + i * 105}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="21" font-weight="800">${f.t}</text>
      <text x="160" y="${584 + i * 105}" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">${f.d}</text>
    `).join('')}

    <!-- Side Metrics Card -->
    ${card(1240, 220, 600, 740, '#FFDAC1', 26, 5)}
    ${washiTape(1300, 208, 150, 26, 2, '#E2F0CB')}
    <text x="1290" y="295" fill="#2D232E" font-family="'Syne', sans-serif" font-size="28" font-weight="800">INDIKATOR UTAMA 2026</text>

    ${[
      { val: '25 HALAMAN', label: 'Grand Design Baku Resmi', sub: 'Standarisasi SOP Keuangan Terpadu', bg: '#FFFFFF' },
      { val: '&lt; 48 JAM', label: 'SLA Verifikasi Berkas', sub: 'Review Proposal &amp; Formulir Pencairan', bg: '#FFF5BA' },
      { val: '100% CLOUD', label: 'Integrasi Arsip Digital', sub: 'Google Workspace Drive Terproteksi', bg: '#E2F0CB' }
    ].map((m, idx) => `
      ${card(1280, 340 + idx * 190, 520, 165, m.bg, 20, 4)}
      <text x="1310" y="${405 + idx * 190}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="40" font-weight="800">${m.val}</text>
      <text x="1310" y="${445 + idx * 190}" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="700">${m.label}</text>
      <text x="1310" y="${478 + idx * 190}" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">${m.sub}</text>
    `).join('')}

    ${createSvgFooter()}
  `),

  // 9: Tupoksi (6 Kartu Memo Ringkas dengan Pin Lencana 1 sampai 6 Warna Dream Yellow)
  () => wrapSvg(`
    ${createSvgHeader(9, 25, 'TUGAS &amp; WEWENANG')}

    ${sticker(80, 115, 600, 46, 'TUGAS POKOK DAN FUNGSI (TUPOKSI)', '#FFF5BA', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">6 Pilar Mandat Operasional Biro Keuangan BEM KMFP UNPAD 2026</text>

    ${[
      { no: '1', title: 'Perumusan Regulasi', desc: 'Menetapkan pedoman standar penganggaran, batas biaya wajar, dan tata tertib LPJ ormawa.', bg: '#FFB7B2' },
      { no: '2', title: 'Pengelolaan Kas &amp; Bank', desc: 'Mencatat, mengawasi, dan merekonsiliasi seluruh arus kas masuk dan kas keluar organisasi.', bg: '#FFDAC1' },
      { no: '3', title: 'Verifikasi Berkas SIAT', desc: 'Meneliti kesesuaian proposal kegiatan sebelum diajukan ke Dekanat Fakultas Pertanian.', bg: '#E2F0CB' },
      { no: '4', title: 'Fasilitasi Pencairan', desc: 'Mengawal proses pencairan dana kemahasiswaan dari rekening universitas ke pelaksana.', bg: '#FFF5BA' },
      { no: '5', title: 'Pembinaan Bendahara', desc: 'Menyelenggarakan asistensi berkala bagi bendahara departemen BEM dan kepanitiaan.', bg: '#E8D7F5' },
      { no: '6', title: 'Transparansi &amp; Audit', desc: 'Menyusun laporan pertanggungjawaban berkala kepada MPM KMFP dan publik mahasiswa.', bg: '#C7CEEA' }
    ].map((item, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = 80 + col * 595;
      const y = 230 + row * 365;
      return `
        <g transform="translate(${x}, ${y})">
          ${card(0, 0, 570, 335, item.bg, 24, 5)}
          
          <!-- Pin Lencana Nomor 1-6 Berlatar Dream Yellow -->
          ${badgeCircle(50, 50, 26, item.no, '#FFF5BA')}
          
          <text x="95" y="58" fill="#2D232E" font-family="'Syne', sans-serif" font-size="26" font-weight="800">${item.title}</text>
          
          <line x1="30" y1="98" x2="540" y2="98" stroke="#2D232E" stroke-width="2" />
          
          <text x="30" y="150" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="500">
            ${wrapText(item.desc, 30, 150, 36, 30)}
          </text>
        </g>
      `;
    }).join('')}

    ${createSvgFooter()}
  `),

  // 10: Analisis SWOT (4 Sticky Notes Neo-Brutalis + Sobekan Kertas Solusi Panjang)
  () => wrapSvg(`
    ${createSvgHeader(10, 25, 'ANALISIS STRATEGIS')}

    ${sticker(80, 115, 620, 46, 'ANALISIS SWOT &amp; EVALUASI SOLUSI', '#E2F0CB', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Pemetaan Kekuatan, Tantangan, dan Mitigasi Solutif Biro Keuangan</text>

    <!-- 4 Sticky Notes Neo-Brutalis -->
    <!-- 1. STRENGTH (#E2F0CB) -->
    <g transform="translate(80, 220)">
      ${washiTape(130, -10, 160, 24, -1, '#FFF5BA')}
      ${card(0, 0, 420, 460, '#E2F0CB', 22, 5)}
      ${badgePill(25, 25, 190, 36, 'STRENGTH', '#FFFFFF', '#2D232E', 15)}
      <text x="25" y="98" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">Kekuatan Utama</text>
      <text x="25" y="145" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; 7 Staf dengan tupoksi terbagi rapi.</text>
      <text x="25" y="200" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Sistem arsip Google Cloud 24/7.</text>
      <text x="25" y="255" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Komunikasi intensif pihak Dekanat.</text>
      <text x="25" y="310" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Standarisasi SOP satu pintu.</text>
    </g>

    <!-- 2. WEAKNESS (#FFB7B2) -->
    <g transform="translate(520, 220)">
      ${washiTape(130, -10, 160, 24, 1, '#FFF5BA')}
      ${card(0, 0, 420, 460, '#FFB7B2', 22, 5)}
      ${badgePill(25, 25, 190, 36, 'WEAKNESS', '#FFFFFF', '#2D232E', 15)}
      <text x="25" y="98" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">Tantangan Internal</text>
      <text x="25" y="145" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Pemahaman bendahara bervariasi.</text>
      <text x="25" y="200" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Risiko nota fisik hilang / rusak.</text>
      <text x="25" y="255" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Pengajuan berkas mepet deadline.</text>
      <text x="25" y="310" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Kesalahan penulisan kuitansi.</text>
    </g>

    <!-- 3. OPPORTUNITY (#FFF5BA) -->
    <g transform="translate(960, 220)">
      ${washiTape(130, -10, 160, 24, -2, '#FFB7B2')}
      ${card(0, 0, 420, 460, '#FFF5BA', 22, 5)}
      ${badgePill(25, 25, 190, 36, 'OPPORTUNITY', '#FFFFFF', '#2D232E', 15)}
      <text x="25" y="98" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">Peluang Eksternal</text>
      <text x="25" y="145" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Digitalisasi penuh portal SIAT.</text>
      <text x="25" y="200" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Fasilitas e-banking &amp; QRIS ormawa.</text>
      <text x="25" y="255" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Template RAB daring baku.</text>
      <text x="25" y="310" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Keterbukaan komunikasi MPM.</text>
    </g>

    <!-- 4. THREAT (#FFDAC1) -->
    <g transform="translate(1400, 220)">
      ${washiTape(130, -10, 160, 24, 2, '#E2F0CB')}
      ${card(0, 0, 440, 460, '#FFDAC1', 22, 5)}
      ${badgePill(25, 25, 190, 36, 'THREAT', '#FFFFFF', '#2D232E', 15)}
      <text x="25" y="98" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">Ancaman Regulasi</text>
      <text x="25" y="145" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Penyesuaian aturan belanja Dekanat.</text>
      <text x="25" y="200" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Keterlambatan termin cair pusat.</text>
      <text x="25" y="255" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Fluktuasi harga sewa vendor acara.</text>
      <text x="25" y="310" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Kenaikan beban pajak sewa alat.</text>
    </g>

    <!-- Sobekan Kertas Solusi Panjang dengan Double Washi Tape -->
    <g transform="translate(80, 715)">
      ${washiTape(120, -10, 170, 24, -2, '#FFB7B2')}
      ${washiTape(1480, -10, 170, 24, 2, '#E2F0CB')}
      ${card(0, 0, 1760, 245, '#FFFFFF', 22, 5)}
      <rect x="0" y="0" width="1760" height="245" fill="url(#linedMemo)" rx="22" />
      
      ${badgePill(40, 25, 360, 36, 'SOLUSI &amp; EVALUASI PENDAMPINGAN', '#FFF5BA', '#2D232E', 15)}
      <text x="40" y="100" fill="#2D232E" font-family="'Syne', sans-serif" font-size="26" font-weight="800">Menghadirkan Helpdesk Keuangan Proaktif &amp; Pendampingan Personal</text>
      <text x="40" y="145" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
        ${wrapText('Setiap 1 Staf Biro Keuangan ditugaskan mendampingi 2-3 departemen khusus secara intensif. Pendampingan mencakup pra-verifikasi nota sebelum belanja, simulasi pengisian RAB, dan konsultasi cepat via grup daring demi mitigasi berkas tertolak di tingkat Dekanat.', 40, 145, 105, 28)}
      </text>
    </g>

    ${createSvgFooter()}
  `),

  // 11: 4 Pilar Mimpi Biro Keuangan (4 Kolom Kartu Vertikal Dream Lavender + Romawi I-IV)
  () => wrapSvg(`
    ${createSvgHeader(11, 25, 'VISI MASA DEPAN')}

    ${sticker(80, 115, 560, 46, '4 PILAR MIMPI BIRO KEUANGAN', '#E8D7F5', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Landasan Kokoh Mewujudkan Keunggulan Tata Kelola Finansial Lembaga 2026</text>

    ${[
      { num: 'I', title: 'Integritas Finansial', badge: 'Zero Fraud Policy', desc: 'Membangun ekosistem keuangan yang jujur, transparan, dan tidak memberikan ruang sekecil apa pun untuk deviasi anggaran.', kpi: 'Opini Audit WTP' },
      { num: 'II', title: 'Transformasi Digital', badge: 'Paperless First', desc: 'Digitalisasi pengarsipan kuitansi dan integrasi portal Master Data demi efisiensi waktu, keamanan data, dan ramah lingkungan.', kpi: '100% Cloud Archive' },
      { num: 'III', title: 'Akselerasi Layanan', badge: 'Fast Service SLA', desc: 'Menghilangkan stigma birokrasi berbelit dengan target verifikasi berkas tuntas dalam batas waktu maksimal 48 jam.', kpi: 'SLA &lt; 48 Jam Kerja' },
      { num: 'IV', title: 'Kolaborasi Harmonis', badge: 'Empowerment', desc: 'Menjadi mitra konsultatif strategis yang memberdayakan dan mengedukasi seluruh bendahara ormawa se-KMFP UNPAD.', kpi: 'Kepuasan Layanan > 90%' }
    ].map((p, idx) => `
      <g transform="translate(${80 + idx * 450}, 225)">
        ${washiTape(130, -10, 150, 24, (idx % 2 === 0 ? -2 : 2), '#FFF5BA')}
        ${card(0, 0, 420, 735, '#E8D7F5', 26, 5)}
        
        <!-- Pin Lencana Angka Romawi I, II, III, IV -->
        ${badgeCircle(65, 65, 34, p.num, '#FFB7B2')}
        
        ${badgePill(120, 46, 260, 38, p.badge, '#FFFFFF', '#2D232E', 15)}
        
        <text x="35" y="160" fill="#2D232E" font-family="'Syne', sans-serif" font-size="28" font-weight="800">${p.title}</text>
        
        <line x1="35" y1="190" x2="385" y2="190" stroke="#2D232E" stroke-width="2" />
        
        <text x="35" y="240" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
          ${wrapText(p.desc, 35, 240, 32, 28)}
        </text>

        <!-- Bottom KPI Box inside Card -->
        <rect x="35" y="570" width="350" height="120" rx="16" fill="#FFFFFF" stroke="#2D232E" stroke-width="2" />
        <text x="55" y="612" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" letter-spacing="1">TARGET UTAMA:</text>
        <text x="55" y="655" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">${p.kpi}</text>
      </g>
    `).join('')}

    ${createSvgFooter()}
  `),

  // 12: Pembatas Bab Program Kerja (Stiker Tipografi Masif Diagonal + X-Cross Washi Tape)
  () => wrapSvg(`
    <!-- X-Cross Washi Tape di Sudut Kiri Atas -->
    ${washiTape(140, 140, 190, 32, 45, '#FFDAC1')}
    ${washiTape(140, 140, 190, 32, -45, '#FFDAC1')}

    <!-- X-Cross Washi Tape di Sudut Kanan Bawah -->
    ${washiTape(1600, 820, 190, 32, 45, '#E2F0CB')}
    ${washiTape(1600, 820, 190, 32, -45, '#E2F0CB')}

    <!-- Massive Centered Stage Card -->
    ${card(140, 130, 1640, 830, '#FFFFFF', 32, 6)}

    <!-- Massive Diagonal Typography Sticker -->
    <g transform="translate(960, 420) rotate(-2)">
      <rect x="-640" y="-130" width="1280" height="260" rx="32" fill="#2D232E" />
      <rect x="-644" y="-134" width="1280" height="260" rx="32" fill="#FFB7B2" stroke="#2D232E" stroke-width="4" />
      
      <text x="0" y="-45" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="800" text-anchor="middle" letter-spacing="4">BAGIAN KEDUA</text>
      <text x="0" y="35" fill="#2D232E" font-family="'Syne', sans-serif" font-size="68" font-weight="800" text-anchor="middle" letter-spacing="-1">PROGRAM KERJA UTAMA</text>
      <text x="0" y="95" fill="#2D232E" font-family="'Syne', sans-serif" font-size="36" font-weight="800" text-anchor="middle">&amp; STANDAR OPERASIONAL PROSEDUR (SOP)</text>
    </g>

    <line x1="260" y1="630" x2="1660" y2="630" stroke="#2D232E" stroke-width="3" />

    <!-- Subtitle Notes -->
    <text x="960" y="695" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="25" font-weight="700" text-anchor="middle">Panduan Komprehensif Tata Kelola Kas, Pengajuan Dana SIAT, Reimburse &amp; Dokumen Baku</text>
    <text x="960" y="745" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="500" text-anchor="middle">Biro Keuangan BEM KMFP Universitas Padjadjaran Periode 2026</text>

    <!-- Bottom Capsule Badges -->
    <g transform="translate(560, 795)">
      ${badgePill(0, 0, 250, 46, 'PROKER 1: TATA KELOLA KAS', '#FFF5BA', '#2D232E', 15)}
      ${badgePill(280, 0, 250, 46, 'PROKER 2: SOSIALISASI', '#FFDAC1', '#2D232E', 15)}
      ${badgePill(560, 0, 250, 46, 'STANDARISASI SIAT', '#E2F0CB', '#2D232E', 15)}
    </g>

    ${createSvgFooter()}
  `),

  // 13: Proker 1 (Manajemen & Tata Kelola Keuangan BEM - Bagian 1)
  () => wrapSvg(`
    ${createSvgHeader(13, 25, 'PROGRAM KERJA UTAMA')}

    ${sticker(80, 115, 640, 46, 'PROKER 1: MANAJEMEN KAS BEM (BAGIAN 1)', '#FFB7B2', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Latar Belakang, Tujuan, Bentuk Kegiatan, dan Tabel Planner Kegiatan</text>

    <!-- Left Memo Card: Latar Belakang &amp; Tujuan -->
    <g transform="translate(80, 220)">
      ${washiTape(80, -10, 160, 24, -2, '#FFDAC1')}
      ${card(0, 0, 850, 740, '#FFDAC1', 26, 5)}
      
      <rect x="30" y="30" width="790" height="680" rx="20" fill="#FFFFFF" stroke="#2D232E" stroke-width="2" />
      
      ${badgePill(50, 50, 250, 40, 'LATAR BELAKANG &amp; TUJUAN', '#FFF5BA', '#2D232E', 15)}
      <text x="50" y="135" fill="#2D232E" font-family="'Syne', sans-serif" font-size="32" font-weight="800">Sentralisasi Buku Kas Besar (BKB)</text>
      
      <text x="50" y="185" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
        ${wrapText('Pencatatan real-time seluruh mutasi penerimaan kas internal BEM, iuran pengurus, dan sponsorship dalam satu sistem buku kas digital terverifikasi ganda.', 50, 185, 48, 28)}
      </text>

      <line x1="50" y1="270" x2="780" y2="270" stroke="#2D232E" stroke-width="2" />
      
      <text x="50" y="315" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">SOP Pencatatan Harian:</text>
      <text x="50" y="360" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Setiap transaksi tercatat maksimal 1x24 jam sejak uang berpindah.</text>
      <text x="50" y="410" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Wajib menyertakan bukti mutasi bank resmi dan kuitansi sah.</text>
      <text x="50" y="460" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Verifikasi silang oleh Staf Operasional dan Wakil Kabiro.</text>

      <text x="50" y="540" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">Tujuan Terukur:</text>
      <text x="50" y="585" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
        ${wrapText('Menghilangkan risiko selisih rupiah pada buku kas dan memastikan laporan keuangan siap diaudit setiap saat tanpa kendala.', 50, 585, 48, 28)}
      </text>
    </g>

    <!-- Right Planner Table Card -->
    <g transform="translate(980, 220)">
      ${washiTape(80, -10, 160, 24, 2, '#E2F0CB')}
      ${card(0, 0, 860, 740, '#E2F0CB', 26, 5)}
      <rect x="30" y="30" width="800" height="680" rx="20" fill="#FFFFFF" stroke="#2D232E" stroke-width="2" />
      
      ${badgePill(50, 50, 290, 40, 'TABEL SIKLUS MINGGUAN / BULANAN', '#E2F0CB', '#2D232E', 15)}
      <text x="50" y="135" fill="#2D232E" font-family="'Syne', sans-serif" font-size="32" font-weight="800">Jadwal Planner Rutin Finansial</text>
      
      <!-- Planner Table Rows -->
      ${[
        { waktu: 'Senin - Rabu', agenda: 'Penerimaan berkas proposal dan verifikasi kuitansi belanja ormawa.' },
        { waktu: 'Kamis', agenda: 'Rekonsiliasi mutasi kas mingguan dan validasi saldo rekening bank BEM.' },
        { waktu: 'Jumat', agenda: 'Rapat pleno internal evaluasi serapan pagu dan penerbitan nota pencairan.' },
        { waktu: 'Akhir Bulan', agenda: 'Penyusunan neraca kas bulanan dan pengarsipan kuitansi fisik bermeterai.' }
      ].map((p, i) => `
        <rect x="50" y="${175 + i * 115}" width="760" height="98" rx="14" fill="#FFF0F5" stroke="#2D232E" stroke-width="1.8" />
        <text x="75" y="${212 + i * 115}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="19" font-weight="800">${p.waktu}</text>
        <text x="75" y="${244 + i * 115}" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">${p.agenda}</text>
      `).join('')}

      <text x="50" y="665" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="800">Hasil: Kepastian pencairan dana minimal H-3 sebelum pelaksanaan acara.</text>
    </g>

    ${createSvgFooter()}
  `),

  // 14: Proker 1 (Manajemen Keuangan - Bagian 2: Panel Metrik Garis Ganda & Pin Badge "TARGET TERUKUR" Mint)
  () => wrapSvg(`
    ${createSvgHeader(14, 25, 'PROGRAM KERJA UTAMA')}

    ${sticker(80, 115, 640, 46, 'PROKER 1: MANAJEMEN KAS BEM (BAGIAN 2)', '#FFB7B2', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Sasaran Kegiatan, Indikator Output &amp; Outcome, dan Siklus Pengawasan MPM</text>

    <!-- 3 Double-Border Metric Panels with Badge "TARGET TERUKUR" #E2F0CB -->
    ${[
      { label: 'Indikator Kecepatan', val: '98%', desc: 'Penyelesaian administrasi LPJ tepat waktu maksimal 14 hari kerja setelah acara tuntas.', bg: '#FFF5BA' },
      { label: 'Akurasi Rekonsiliasi', val: '100%', desc: 'Nol rupiah selisih antara fisik kas, rekening bank, dan buku kas besar.', bg: '#E2F0CB' },
      { label: 'Kepatuhan Format Nota', val: '95%', desc: 'Nota resmi berstempel basah dan kuitansi bermeterai sesuai regulasi Dekanat.', bg: '#FFDAC1' }
    ].map((m, idx) => `
      <g transform="translate(${80 + idx * 590}, 225)">
        <!-- Double Border Panel Neo-Brutalis -->
        ${card(0, 0, 570, 320, m.bg, 24, 5)}
        <rect x="12" y="12" width="546" height="296" rx="18" fill="none" stroke="#2D232E" stroke-width="2" stroke-dasharray="7,4" />
        
        <!-- Pin Lencana "TARGET TERUKUR" #E2F0CB -->
        ${badgePill(35, 30, 210, 36, 'TARGET TERUKUR', '#E2F0CB', '#2D232E', 15)}
        
        <text x="35" y="105" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">${m.label}</text>
        <text x="35" y="190" fill="#2D232E" font-family="'Syne', sans-serif" font-size="74" font-weight="800">${m.val}</text>
        <text x="35" y="245" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">
          ${wrapText(m.desc, 35, 245, 42, 26)}
        </text>
      </g>
    `).join('')}

    <!-- Bottom Monitoring Cycle Card -->
    ${card(80, 580, 1760, 375, '#FFFFFF', 26, 5)}
    ${washiTape(140, 568, 170, 26, -2, '#FFB7B2')}
    <text x="130" y="645" fill="#2D232E" font-family="'Syne', sans-serif" font-size="32" font-weight="800">Siklus Pelaporan &amp; Pengawasan Finansial Eksternal</text>
    <text x="130" y="690" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19">
      ${wrapText('Transparansi adalah komitmen konstitusional Biro Keuangan BEM KMFP kepada MPM dan sivitas akademika Fakultas Pertanian.', 130, 690, 105, 28)}
    </text>

    <line x1="130" y1="735" x2="1780" y2="735" stroke="#2D232E" stroke-width="2" />
    
    <g transform="translate(130, 760)">
      ${badgePill(0, 0, 280, 36, '1. LAPORAN TRIWULANAN', '#FFF5BA', '#2D232E', 15)}
      <text x="0" y="70" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
        ${wrapText('Penyampaian buku kas dan realisasi program per 3 bulan ke MPM dan publikasi infografis ringkas ke sivitas mahasiswa.', 0, 70, 66, 26)}
      </text>
    </g>

    <g transform="translate(980, 760)">
      ${badgePill(0, 0, 280, 36, '2. LPJ PARIPURNA AKHIR', '#FFDAC1', '#2D232E', 15)}
      <text x="0" y="70" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
        ${wrapText('Audit tutup buku komprehensif seluruh transaksi penerimaan dan belanja selama 1 tahun masa khidmat kabinet.', 0, 70, 66, 26)}
      </text>
    </g>

    ${createSvgFooter()}
  `),

  // 15: Berkas Pengajuan Dana SIAT (5 Folder Arsip Bertumpuk + Checklist Badge)
  () => wrapSvg(`
    ${createSvgHeader(15, 25, 'REGULASI FAKULTAS')}

    ${sticker(80, 115, 620, 46, 'BERKAS PENGAJUAN DANA SIAT DEKANAT', '#E2F0CB', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">5 Berkas Mandatori Standar Pemeriksaan Fakultas Pertanian UNPAD</text>

    <!-- 5 Stacked Archive Folder Tabs -->
    ${[
      { no: '1', title: 'Proposal Resmi', items: ['Tanda tangan Ketua BEM', 'RAB detail per pos belanja', 'Pengajuan minimal H-21'], bg: '#FFB7B2' },
      { no: '2', title: 'Surat SPPD', items: ['Nomor rekening ormawa', 'Nominal pengajuan pas', 'Surat tugas panitia'], bg: '#FFDAC1' },
      { no: '3', title: 'Surat Izin (SIK)', items: ['Persetujuan Pembina', 'Rundown tervalidasi', 'Surat pinjam ruangan'], bg: '#FFF5BA' },
      { no: '4', title: 'Surat Tugas Dekan', items: ['Diterbitkan Wadek I', 'Daftar nama dan NPM', 'Syarat legal pencairan'], bg: '#E2F0CB' },
      { no: '5', title: 'Format LPJ Baku', items: ['Nota asli bermeterai', 'Daftar hadir ber-NPM', 'Foto dokumentasi acara'], bg: '#E8D7F5' }
    ].map((f, idx) => `
      <g transform="translate(${80 + idx * 352}, 225)">
        <!-- Folder Tab Header -->
        <path d="M 0 30 L 40 0 L 160 0 L 190 30 Z" fill="#2D232E" />
        <path d="M 0 28 L 40 2 L 160 2 L 190 28 Z" fill="${f.bg}" stroke="#2D232E" stroke-width="2" />
        <text x="95" y="21" fill="#2D232E" font-family="'Syne', sans-serif" font-size="14" font-weight="800" text-anchor="middle">TAB 0${f.no}</text>
        
        <!-- Folder Body Card -->
        ${card(0, 30, 332, 705, f.bg, 22, 4)}
        
        <!-- Checklist Badge -->
        ${badgeCircle(45, 75, 22, f.no, '#FFFFFF')}
        <text x="85" y="83" fill="#2D232E" font-family="'Syne', sans-serif" font-size="22" font-weight="800">${f.title}</text>
        
        <line x1="25" y1="120" x2="305" y2="120" stroke="#2D232E" stroke-width="2" />
        
        <rect x="25" y="145" width="282" height="435" rx="16" fill="#FFFFFF" stroke="#2D232E" stroke-width="1.8" />
        
        <text x="45" y="185" fill="#2D232E" font-family="'Syne', sans-serif" font-size="17" font-weight="800">Kelengkapan Wajib:</text>
        ${f.items.map((it, i) => `
          <rect x="45" y="${220 + i * 90}" width="20" height="20" rx="5" fill="#E2F0CB" stroke="#2D232E" stroke-width="1.8" />
          <polyline points="48,230 53,235 62,225" fill="none" stroke="#2D232E" stroke-width="2.2" />
          <text x="75" y="${236 + i * 90}" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600">
            ${wrapText(it, 75, 236 + i * 90, 18, 22)}
          </text>
        `).join('')}

        <!-- Status Bottom Sticker -->
        <rect x="25" y="600" width="282" height="110" rx="14" fill="#FFF5BA" stroke="#2D232E" stroke-width="1.8" />
        <text x="45" y="635" fill="#2D232E" font-family="'Syne', sans-serif" font-size="14" font-weight="800">STATUS VALIDASI:</text>
        <text x="45" y="665" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="700">Wajib Lolos Staf SIAT</text>
        <text x="45" y="690" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">Sebelum Unggah Portal</text>
      </g>
    `).join('')}

    ${createSvgFooter()}
  `),

  // 16: Alur SIAT (Roadmap 6 Tahapan + Garis Putus Tebal + Pin Bulat Dream Peach #FFDAC1)
  () => wrapSvg(`
    ${createSvgHeader(16, 25, 'DIAGRAM ALUR PROSEDUR')}

    ${sticker(80, 115, 640, 46, 'ALUR PENGAJUAN &amp; PENCAIRAN SIAT', '#FFDAC1', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Lintasan Langkah 6 Tahapan Terhubung Menuju Pencairan Dana Dekanat</text>

    <!-- Roadmap Connector Line (Thick Dashed Line) -->
    <line x1="200" y1="560" x2="1700" y2="560" stroke="#2D232E" stroke-width="4.5" stroke-dasharray="14,9" />

    <!-- 6 Roadmap Stages -->
    ${[
      { step: '01', title: 'Input SIAT', actor: 'Panitia Pelaksana', desc: 'Unggah proposal dan berkas kelengkapan ke portal SIAT.', yOff: -190 },
      { step: '02', title: 'Pra-Verifikasi', actor: 'Staf SIAT Bikeu', desc: 'Pemeriksaan keabsahan pagu, rincian RAB, dan kelayakan biaya.', yOff: 70 },
      { step: '03', title: 'Otorisasi', actor: 'Manajer Keuangan', desc: 'Penelaahan berkas fisik dan validasi pejabat dekanat.', yOff: -190 },
      { step: '04', title: 'Penerbitan SPM', actor: 'Subbag Keuangan', desc: 'Penerbitan Surat Perintah Membayar ke rektorat universitas.', yOff: 70 },
      { step: '05', title: 'Pencairan', actor: 'Keuangan UNPAD', desc: 'Transfer dana langsung ke rekening resmi ormawa pelaksana.', yOff: -190 },
      { step: '06', title: 'LPJ Akhir', actor: 'Panitia &amp; Bikeu', desc: 'Pengumpulan seluruh nota sah maksimal 14 hari pasca acara.', yOff: 70 }
    ].map((st, idx) => {
      const cx = 90 + idx * 295;
      const cardY = 500 + st.yOff;
      return `
        <!-- Stage Card -->
        <g transform="translate(${cx}, ${cardY})">
          ${card(0, 0, 280, 230, '#FFFFFF', 20, 5)}
          
          <!-- Pin Lencana Nomor Bulat Warna Dream Peach #FFDAC1 -->
          ${badgeCircle(40, 40, 22, st.step, '#FFDAC1')}
          <text x="75" y="48" fill="#2D232E" font-family="'Syne', sans-serif" font-size="19" font-weight="800">${st.title}</text>
          
          <rect x="20" y="70" width="240" height="30" rx="15" fill="#FFF5BA" stroke="#2D232E" stroke-width="1.5" />
          <text x="140" y="90" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="800" text-anchor="middle">${st.actor}</text>
          
          <text x="20" y="135" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">
            ${wrapText(st.desc, 20, 135, 24, 22)}
          </text>
        </g>

        <!-- Connector Pin Marker on Center Line -->
        <circle cx="${cx + 140}" cy="560" r="16" fill="#FFDAC1" stroke="#2D232E" stroke-width="3" />
        <circle cx="${cx + 140}" cy="560" r="6" fill="#2D232E" />
      `;
    }).join('')}

    ${createSvgFooter()}
  `),

  // 17: Ketentuan Lampiran Dekanat & Pajak (Stiker Pita Dream Pink "Maksimal H-30" + Tabel 2 Kolom Tegas)
  () => wrapSvg(`
    ${createSvgHeader(17, 25, 'REGULASI BIAYA &amp; PAJAK')}

    ${sticker(80, 115, 640, 46, 'KETENTUAN LAMPIRAN, PAJAK &amp; SEWA', '#FFB7B2', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Standar Biaya Wajar (SBW) Dekanat Fakultas Pertanian UNPAD 2026</text>

    <!-- Stiker Pita Dream Pink: Peringatan Batas Waktu Maksimal H-30 -->
    <g transform="translate(80, 220)">
      <rect x="5" y="5" width="1760" height="66" rx="18" fill="#2D232E" />
      <rect x="0" y="0" width="1760" height="66" rx="18" fill="#FFB7B2" stroke="#2D232E" stroke-width="3" />
      <text x="880" y="42" fill="#2D232E" font-family="'Syne', sans-serif" font-size="22" font-weight="800" text-anchor="middle" letter-spacing="1">
        PERINGATAN MANDATORI: PENGAJUAN BERKAS KE DEKANAT MAKSIMAL H-30 SEBELUM HARI KEGIATAN
      </text>
    </g>

    <!-- 2 Column Comparison Card: Honorarium vs Beban Sewa -->
    <!-- Column 1: Pajak Honorarium (2.5%) -->
    <g transform="translate(80, 315)">
      ${card(0, 0, 860, 640, '#FFF5BA', 26, 5)}
      <rect x="30" y="30" width="800" height="580" rx="20" fill="#FFFFFF" stroke="#2D232E" stroke-width="2" />
      
      ${badgePill(50, 50, 260, 40, 'PAJAK HONORARIUM (2.5%)', '#FFB7B2', '#2D232E', 15)}
      <text x="50" y="135" fill="#2D232E" font-family="'Syne', sans-serif" font-size="32" font-weight="800">Honorarium Pemateri &amp; Juri</text>
      
      <line x1="50" y1="165" x2="780" y2="165" stroke="#2D232E" stroke-width="2" />
      
      <text x="50" y="210" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="800">&#8226; Pemotongan Pajak PPh Pasal 21:</text>
      <text x="70" y="248" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
        ${wrapText('Pemateri ber-NPWP dikenakan tarif pajak 2.5%, sedangkan tanpa NPWP dikenakan tarif 3.0%.', 70, 248, 46, 28)}
      </text>

      <text x="50" y="335" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="800">&#8226; Dokumen Lampiran Mandatori:</text>
      <text x="70" y="375" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">1. Curriculum Vitae (CV) narasumber terbaru.</text>
      <text x="70" y="415" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">2. Fotokopi KTP dan NPWP narasumber.</text>
      <text x="70" y="455" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">3. Tanda terima honorarium resmi bertanda tangan basah.</text>
      <text x="70" y="495" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">4. Bukti potong pajak dari bendahara dekanat.</text>

      <rect x="50" y="525" width="760" height="65" rx="14" fill="#FFF0F5" stroke="#2D232E" stroke-width="1.8" />
      <text x="75" y="565" fill="#2D232E" font-family="'Syne', sans-serif" font-size="17" font-weight="800">Batas Maksimal Honorarium: Mengacu SK Rektor UNPAD 2026.</text>
    </g>

    <!-- Column 2: Pajak Sewa (2% / 4%) &amp; Kuitansi -->
    <g transform="translate(980, 315)">
      ${card(0, 0, 860, 640, '#E2F0CB', 26, 5)}
      <rect x="30" y="30" width="800" height="580" rx="20" fill="#FFFFFF" stroke="#2D232E" stroke-width="2" />
      
      ${badgePill(50, 50, 250, 40, 'PAJAK SEWA (2% / 4%)', '#FFDAC1', '#2D232E', 15)}
      <text x="50" y="135" fill="#2D232E" font-family="'Syne', sans-serif" font-size="32" font-weight="800">Sewa Peralatan &amp; Tempat</text>
      
      <line x1="50" y1="165" x2="780" y2="165" stroke="#2D232E" stroke-width="2" />
      
      <text x="50" y="210" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="800">&#8226; Pemotongan Pajak PPh Pasal 23:</text>
      <text x="70" y="248" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
        ${wrapText('Sewa peralatan sound, panggung, tenda ber-NPWP dikenakan pajak 2%, non-NPWP 4%.', 70, 248, 46, 28)}
      </text>

      <text x="50" y="335" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="800">&#8226; Regulasi Meterai &amp; Nota Sah:</text>
      <text x="70" y="375" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">1. Transaksi &gt; Rp 5.000.000 wajib meterai Rp 10.000.</text>
      <text x="70" y="415" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">2. Stempel toko harus basah dan menyentuh tanda tangan.</text>
      <text x="70" y="455" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">3. Rincian nota wajib memuat kuantitas dan harga satuan.</text>
      <text x="70" y="495" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">4. Tidak boleh terdapat coretan atau tip-ex angka nominal.</text>

      <rect x="50" y="525" width="760" height="65" rx="14" fill="#FFF0F5" stroke="#2D232E" stroke-width="1.8" />
      <text x="75" y="565" fill="#2D232E" font-family="'Syne', sans-serif" font-size="17" font-weight="800">Wajib lampirkan Berita Acara Serah Terima (BAST) vendor.</text>
    </g>

    ${createSvgFooter()}
  `),

  // 18: Alur Dana Internal (Urutan Kartu Tiket Bersambung + Lencana Heksagonal + Panah Tebal)
  () => wrapSvg(`
    ${createSvgHeader(18, 25, 'DANA INTERNAL BEM')}

    ${sticker(80, 115, 640, 46, 'ALUR PERMOHONAN DANA INTERNAL KAS', '#FFDAC1', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Prosedur Standar Penggunaan Kas Operasional BEM KMFP UNPAD 2026</text>

    <!-- 4 Continuous Ticket Cards with Arrow Connectors -->
    ${[
      { step: '1', title: 'Formulir Permohonan', desc: 'Departemen mengisi Formulir Kas Internal lengkap rincian kebutuhan mendesak.', bg: '#FFB7B2' },
      { step: '2', title: 'Telaah Urgensi', desc: 'Wakil Kabiro &amp; Bendahara memverifikasi urgensi program dan ketersediaan saldo.', bg: '#FFF5BA' },
      { step: '3', title: 'Otorisasi Kabiro', desc: 'Kepala Biro menandatangani nota persetujuan setelah disetujui Ketua BEM.', bg: '#FFDAC1' },
      { step: '4', title: 'Pencairan Kas', desc: 'Penyerahan dana secara transfer bank dengan bukti transfer resmi terlampir.', bg: '#E2F0CB' }
    ].map((f, i) => `
      <g transform="translate(${80 + i * 450}, 235)">
        <!-- Ticket Perforated Header Strip -->
        <rect x="0" y="0" width="410" height="64" rx="16" fill="#2D232E" />
        <rect x="0" y="0" width="410" height="62" rx="16" fill="${f.bg}" stroke="#2D232E" stroke-width="2.2" />
        <text x="205" y="38" fill="#2D232E" font-family="'Syne', sans-serif" font-size="18" font-weight="800" text-anchor="middle">TIKET TAHAP 0${f.step}</text>
        
        <!-- Ticket Body Card -->
        ${card(0, 50, 410, 655, '#FFFFFF', 22, 5)}
        
        <!-- Hexagonal Badge -->
        ${badgeCircle(50, 110, 28, f.step, f.bg)}
        <text x="95" y="118" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">${f.title}</text>
        
        <line x1="30" y1="160" x2="380" y2="160" stroke="#2D232E" stroke-width="2" />
        
        <text x="30" y="215" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
          ${wrapText(f.desc, 30, 215, 30, 30)}
        </text>

        <rect x="30" y="550" width="350" height="120" rx="16" fill="#FFF0F5" stroke="#2D232E" stroke-width="1.8" />
        <text x="50" y="595" fill="#2D232E" font-family="'Syne', sans-serif" font-size="15" font-weight="800">SLA PROSES:</text>
        <text x="50" y="635" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">Maks. 2x24 Jam Kerja</text>
      </g>

      ${i < 3 ? `
        <!-- Thick Arrow Connector -->
        <polygon points="${505 + i * 450},550 ${528 + i * 450},562 ${505 + i * 450},574" fill="#2D232E" />
      ` : ''}
    `).join('')}

    ${createSvgFooter()}
  `),

  // 19: Alur Reimburse (Kartu Tiket Bersambung + Lencana Heksagonal + Syarat Mandatori)
  () => wrapSvg(`
    ${createSvgHeader(19, 25, 'KLAIM DANA TALANGAN')}

    ${sticker(80, 115, 660, 46, 'ALUR REIMBURSE (PENGGANTIAN DANA)', '#E8D7F5', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Mekanisme Klaim Penggantian Dana Talangan yang Transparan dan Terukur</text>

    <!-- 4 Continuous Ticket Cards -->
    ${[
      { step: '1', title: 'Pengumpulan Nota', desc: 'Pengurus menyusun nota belanja fisik asli tanpa coretan pada lembar formulir klaim.', bg: '#FFB7B2' },
      { step: '2', title: 'Validasi Staf', desc: 'Staf verifikasi mencocokkan nota dengan pos pagu dan mengecek keabsahan stempel toko.', bg: '#FFF5BA' },
      { step: '3', title: 'Otorisasi Voucher', desc: 'Penerbitan voucher penggantian kas oleh Kepala Biro Keuangan BEM KMFP.', bg: '#E8D7F5' },
      { step: '4', title: 'Pencairan Dana', desc: 'Pencairan dana langsung ke rekening pemohon maksimal 1x24 jam pasca validasi.', bg: '#E2F0CB' }
    ].map((f, i) => `
      <g transform="translate(${80 + i * 450}, 235)">
        <rect x="0" y="0" width="410" height="64" rx="16" fill="#2D232E" />
        <rect x="0" y="0" width="410" height="62" rx="16" fill="${f.bg}" stroke="#2D232E" stroke-width="2.2" />
        <text x="205" y="38" fill="#2D232E" font-family="'Syne', sans-serif" font-size="18" font-weight="800" text-anchor="middle">REIMBURSE 0${f.step}</text>
        
        ${card(0, 50, 410, 655, '#FFFFFF', 22, 5)}
        
        ${badgeCircle(50, 110, 28, f.step, f.bg)}
        <text x="95" y="118" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">${f.title}</text>
        
        <line x1="30" y1="160" x2="380" y2="160" stroke="#2D232E" stroke-width="2" />
        
        <text x="30" y="215" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
          ${wrapText(f.desc, 30, 215, 30, 30)}
        </text>

        <rect x="30" y="550" width="350" height="120" rx="16" fill="#FFF0F5" stroke="#2D232E" stroke-width="1.8" />
        <text x="50" y="595" fill="#2D232E" font-family="'Syne', sans-serif" font-size="15" font-weight="800">SYARAT MANDATORI:</text>
        <text x="50" y="635" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="800">Batas Klaim Maks. 7 Hari</text>
      </g>

      ${i < 3 ? `
        <polygon points="${505 + i * 450},550 ${528 + i * 450},562 ${505 + i * 450},574" fill="#2D232E" />
      ` : ''}
    `).join('')}

    ${createSvgFooter()}
  `),

  // 20: Alur Peminjaman Dana (Kartu Tiket Bersambung + Lencana Heksagonal + Panah Tebal)
  () => wrapSvg(`
    ${createSvgHeader(20, 25, 'REGULASI PINJAMAN')}

    ${sticker(80, 115, 640, 46, 'ALUR PEMINJAMAN DANA KAS', '#FFDAC1', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Tata Kelola Pinjaman Kas Organisasi bagi Kepanitiaan Mendesak</text>

    <!-- 4 Continuous Ticket Cards with Thick Arrow Connectors -->
    ${[
      { step: 'A', title: 'Surat Permohonan', desc: 'Kepanitiaan mengajukan surat permohonan resmi bermeterai ditandatangani Ketua Pelaksana.', bg: '#FFB7B2' },
      { step: 'B', title: 'Rencana Pelunasan', desc: 'Melampirkan sumber pengembalian jelas (estimasi sponsor, penjualan tiket, atau termin dekanat).', bg: '#FFF5BA' },
      { step: 'C', title: 'Akad MoU Bersama', desc: 'Penandatanganan nota kesepahaman batas pengembalian kas disaksikan Wakil Ketua BEM.', bg: '#FFDAC1' },
      { step: 'D', title: 'Penyelesaian Kas', desc: 'Penyetoran kembali kas utuh ke rekening BEM paling lambat 7 hari setelah acara berakhir.', bg: '#E2F0CB' }
    ].map((f, i) => `
      <g transform="translate(${80 + i * 450}, 235)">
        <rect x="0" y="0" width="410" height="64" rx="16" fill="#2D232E" />
        <rect x="0" y="0" width="410" height="62" rx="16" fill="${f.bg}" stroke="#2D232E" stroke-width="2.2" />
        <text x="205" y="38" fill="#2D232E" font-family="'Syne', sans-serif" font-size="18" font-weight="800" text-anchor="middle">PINJAMAN TAHAP ${f.step}</text>
        
        ${card(0, 50, 410, 655, '#FFFFFF', 22, 5)}
        
        ${badgeCircle(50, 110, 28, f.step, f.bg)}
        <text x="95" y="118" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">${f.title}</text>
        
        <line x1="30" y1="160" x2="380" y2="160" stroke="#2D232E" stroke-width="2" />
        
        <text x="30" y="215" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
          ${wrapText(f.desc, 30, 215, 30, 30)}
        </text>

        <rect x="30" y="550" width="350" height="120" rx="16" fill="#FFF0F5" stroke="#2D232E" stroke-width="1.8" />
        <text x="50" y="595" fill="#2D232E" font-family="'Syne', sans-serif" font-size="15" font-weight="800">TENGGAT WAKTU PELUNASAN:</text>
        <text x="50" y="635" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">Maks. H+7 Acara Selesai</text>
      </g>

      ${i < 3 ? `
        <polygon points="${505 + i * 450},550 ${528 + i * 450},562 ${505 + i * 450},574" fill="#2D232E" />
      ` : ''}
    `).join('')}

    ${createSvgFooter()}
  `),

  // 21: Proker 2 (Sosialisasi Bendahara - Silabus Workshop & Stiker "WORKSHOP & EDUKASI" & Box Peach #FFDAC1)
  () => wrapSvg(`
    ${createSvgHeader(21, 25, 'PROGRAM KERJA EDUKASI')}

    ${sticker(80, 115, 640, 46, 'PROKER 2: SOSIALISASI BENDAHARA', '#FFDAC1', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Pemberdayaan Finansial Ormawa Se-Keluarga Mahasiswa Fakultas Pertanian</text>

    <!-- Silabus Workshop Card -->
    ${card(80, 220, 1120, 740, '#FFFFFF', 26, 5)}
    ${washiTape(140, 208, 170, 26, -2, '#FFB7B2')}
    
    <!-- Stiker Tipografi "WORKSHOP &amp; EDUKASI" -->
    ${sticker(130, 255, 320, 46, 'WORKSHOP &amp; EDUKASI', '#FFDAC1', 17, 14)}
    
    <text x="130" y="345" fill="#2D232E" font-family="'Syne', sans-serif" font-size="34" font-weight="800">Klinik &amp; Bimbingan Teknis Keuangan Ormawa</text>
    <text x="130" y="395" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19">
      ${wrapText('Program transfer pengetahuan tata kelola keuangan ormawa guna menyamakan pemahaman standar nota, aturan pajak dekanat, dan teknik perakitan LPJ.', 130, 395, 62, 28)}
    </text>

    <line x1="130" y1="470" x2="1140" y2="470" stroke="#2D232E" stroke-width="2" />
    
    <text x="130" y="515" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">Materi Silabus Komprehensif:</text>
    ${[
      { t: '1. Bedah Regulasi SIAT Dekanat', d: 'Simulasi alur input portal fakultas dan penyiapan berkas lampiran pendukung.' },
      { t: '2. Teknik Penyusunan RAB Baku 8 Kolom', d: 'Menghitung volume, satuan, dan estimasi biaya realistis tanpa deviasi.' },
      { t: '3. Klinik Pengesahan Kuitansi &amp; Nota', d: 'Studi kasus nota valid vs nota bermasalah dan ketentuan meterai Rp 10.000.' },
      { t: '4. Praktik Master Data Online Terpadu', d: 'Tata cara mengunduh formulir resmi dan mengunggah laporan kas digital.' }
    ].map((m, i) => `
      <rect x="130" y="${540 + i * 95}" width="1020" height="82" rx="16" fill="#FFF0F5" stroke="#2D232E" stroke-width="1.8" />
      <text x="160" y="${574 + i * 95}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="19" font-weight="800">${m.t}</text>
      <text x="160" y="${604 + i * 95}" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">${m.d}</text>
    `).join('')}

    <!-- Side Success Indicators Box Dream Peach (#FFDAC1) -->
    ${card(1240, 220, 600, 740, '#FFDAC1', 26, 5)}
    ${washiTape(1300, 208, 150, 26, 2, '#FFF5BA')}
    <text x="1290" y="295" fill="#2D232E" font-family="'Syne', sans-serif" font-size="28" font-weight="800">INDIKATOR KEBERHASILAN</text>

    ${[
      { val: '100% BENDAHARA', label: 'Seluruh Departemen &amp; Himpunan', sub: 'Wajib mengutus perwakilan bendahara', bg: '#FFFFFF' },
      { val: '2 KALI / PERIODE', label: 'Semester Ganjil &amp; Genap', sub: 'Awal kepengurusan &amp; pertengahan tahun', bg: '#FFF5BA' },
      { val: 'KONSULTASI GRATIS', label: 'Bikeu Helpdesk Online 24/7', sub: 'Pendampingan langsung staf narahubung', bg: '#E2F0CB' }
    ].map((m, idx) => `
      ${card(1280, 340 + idx * 190, 520, 165, m.bg, 20, 4)}
      <text x="1310" y="${405 + idx * 190}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="34" font-weight="800">${m.val}</text>
      <text x="1310" y="${445 + idx * 190}" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="700">${m.label}</text>
      <text x="1310" y="${478 + idx * 190}" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">${m.sub}</text>
    `).join('')}

    ${createSvgFooter()}
  `),

  // 22: Master Data & Timeline (Tiket Pass Perforated + Stempel "KLIK/SCAN" + bit.ly/MASTERDATABIROKEUANGAN)
  () => wrapSvg(`
    ${createSvgHeader(22, 25, 'SENTRALISASI DATA')}

    ${sticker(80, 115, 620, 46, 'MASTER DATA DAN TIMELINE ANGGARAN', '#C7CEEA', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Akses Satu Pintu Berkas Digital &amp; Kalender Anggaran Tahunan 2026</text>

    <!-- Perforated Digital Ticket Pass for Master Data -->
    <g transform="translate(80, 225)">
      ${card(0, 0, 1760, 265, '#FFFFFF', 26, 5)}
      
      <!-- Serrated Perforated Ticket Divider -->
      <line x1="500" y1="20" x2="500" y2="245" stroke="#2D232E" stroke-width="2.5" stroke-dasharray="8,6" />
      <circle cx="500" cy="0" r="16" fill="#FFF0F5" stroke="#2D232E" stroke-width="2" />
      <circle cx="500" cy="265" r="16" fill="#FFF0F5" stroke="#2D232E" stroke-width="2" />

      <!-- Left Stub: QR Code &amp; Stamp Badge -->
      <g transform="translate(60, 35)">
        <!-- Simulated QR Code Container -->
        <rect x="0" y="0" width="165" height="165" rx="14" fill="#FFF5BA" stroke="#2D232E" stroke-width="2.2" />
        <rect x="22" y="22" width="42" height="42" fill="#2D232E" />
        <rect x="101" y="22" width="42" height="42" fill="#2D232E" />
        <rect x="22" y="101" width="42" height="42" fill="#2D232E" />
        <rect x="82" y="82" width="22" height="22" fill="#2D232E" />
        <rect x="112" y="112" width="31" height="31" fill="#2D232E" />
        <text x="82" y="188" fill="#2D232E" font-family="'Syne', sans-serif" font-size="13" font-weight="800" text-anchor="middle">SCAN / KLIK</text>

        <!-- Stiker Stempel "KLIK / SCAN UNTUK AKSES" -->
        <g transform="translate(200, 42) rotate(-4)">
          <rect x="3" y="3" width="190" height="72" rx="10" fill="#2D232E" />
          <rect x="0" y="0" width="190" height="72" rx="10" fill="#FFB7B2" stroke="#2D232E" stroke-width="2.2" stroke-dasharray="6,3" />
          <text x="95" y="30" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" text-anchor="middle">HOTSPOT AKTIF</text>
          <text x="95" y="56" fill="#2D232E" font-family="'Syne', sans-serif" font-size="18" font-weight="800" text-anchor="middle">KLIK / SCAN</text>
        </g>
      </g>

      <!-- Right Main Ticket: Portal Information -->
      <g transform="translate(560, 35)">
        ${badgePill(0, 0, 340, 36, 'PORTAL MASTER DATA RESMI 2026', '#E2F0CB', '#2D232E', 15)}
        <text x="0" y="78" fill="#2D232E" font-family="'Syne', sans-serif" font-size="36" font-weight="800">bit.ly/MASTERDATABIROKEUANGAN</text>
        <text x="0" y="125" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
          Pusat unduhan seluruh formulir pengajuan kas, format LPJ dekanat, kalkulator pajak, dan template RAB 8 kolom resmi.
        </text>
        <text x="0" y="170" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="700">
          Akses Terbuka &amp; Terproteksi untuk Seluruh Bendahara Departemen BEM KMFP UNPAD.
        </text>
      </g>
    </g>

    <!-- 4 Timeline Cards (Q1 - Q4) -->
    <text x="80" y="540" fill="#2D232E" font-family="'Syne', sans-serif" font-size="28" font-weight="800">TIMELINE ANGGARAN &amp; KERJA FINANSIAL 2026</text>
    ${[
      { q: 'Q1 (Jan - Mar)', title: 'Penyusunan Pagu &amp; Sosialisasi', task: 'Kompilasi RAB kabinet, workshop bendahara angkatan, aktivasi portal Master Data.', bg: '#FFB7B2' },
      { q: 'Q2 (Apr - Jun)', title: 'Pencairan SIAT 1 &amp; Audit 1', task: 'Monitoring serapan dana program semester ganjil dan rilis Laporan Kas Triwulan 1 ke MPM.', bg: '#FFF5BA' },
      { q: 'Q3 (Jul - Sep)', title: 'Pencairan SIAT 2 &amp; Review', task: 'Fasilitasi program kerja besar Dies Natalis dan penertiban berkas SPPD dekanat.', bg: '#E8D7F5' },
      { q: 'Q4 (Okt - Des)', title: 'Rekonsiliasi &amp; LPJ Akhir', task: 'Audit tutup buku kas, pengembalian sisa saldo kas, dan sidang pleno LPJ akhir.', bg: '#E2F0CB' }
    ].map((t, i) => `
      <g transform="translate(${80 + i * 450}, 570)">
        ${washiTape(120, -10, 150, 24, (i % 2 === 0 ? -2 : 2), '#FFFFFF')}
        ${card(0, 0, 420, 390, t.bg, 24, 5)}
        ${badgePill(30, 25, 200, 36, t.q, '#FFFFFF', '#2D232E', 15)}
        <text x="30" y="110" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">${t.title}</text>
        <line x1="30" y1="140" x2="390" y2="140" stroke="#2D232E" stroke-width="2" />
        <text x="30" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
          ${wrapText(t.task, 30, 190, 32, 28)}
        </text>
      </g>
    `).join('')}

    ${createSvgFooter()}
  `),

  // 23: Template Rencana Anggaran Biaya (RAB) - Kartu Tiket Kembar Dream Mint (#E2F0CB)
  () => wrapSvg(`
    ${createSvgHeader(23, 25, 'INSTRUMEN FORMAT')}

    ${sticker(80, 115, 640, 46, 'TEMPLATE RENCANA ANGGARAN BIAYA (RAB)', '#E2F0CB', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Format Standar 8 Kolom Resmi Pengajuan Anggaran BEM KMFP UNPAD 2026</text>

    <!-- Twin Ticket Format Card in Dream Mint (#E2F0CB) -->
    ${card(80, 220, 1760, 740, '#E2F0CB', 26, 5)}
    
    <!-- Table Header Row -->
    <g transform="translate(110, 250)">
      <rect x="0" y="0" width="1700" height="64" rx="16" fill="#2D232E" />
      <text x="40" y="40" fill="#FFFFFF" font-family="'Syne', sans-serif" font-size="17" font-weight="800">NO</text>
      <text x="120" y="40" fill="#FFFFFF" font-family="'Syne', sans-serif" font-size="17" font-weight="800">URAIAN PENGELUARAN</text>
      <text x="680" y="40" fill="#FFFFFF" font-family="'Syne', sans-serif" font-size="17" font-weight="800">VOLUME</text>
      <text x="840" y="40" fill="#FFFFFF" font-family="'Syne', sans-serif" font-size="17" font-weight="800">SATUAN</text>
      <text x="1020" y="40" fill="#FFFFFF" font-family="'Syne', sans-serif" font-size="17" font-weight="800">HARGA SATUAN</text>
      <text x="1260" y="40" fill="#FFFFFF" font-family="'Syne', sans-serif" font-size="17" font-weight="800">TOTAL BIAYA</text>
      <text x="1480" y="40" fill="#FFFFFF" font-family="'Syne', sans-serif" font-size="17" font-weight="800">SUMBER DANA</text>
    </g>

    <!-- Table Body Rows -->
    ${[
      { no: '1', item: 'Honorarium Pemateri Seminar Nasional', vol: '2', sat: 'Orang', unit: 'Rp 1.500.000', tot: 'Rp 3.000.000', src: 'SIAT Dekanat' },
      { no: '2', item: 'Konsumsi Peserta &amp; Panitia (Prasmanan)', vol: '150', sat: 'Porsi', unit: 'Rp 30.000', tot: 'Rp 4.500.000', src: 'SIAT Dekanat' },
      { no: '3', item: 'Sewa Sound System &amp; Lighting Lapangan', vol: '1', sat: 'Paket/Hari', unit: 'Rp 2.500.000', tot: 'Rp 2.500.000', src: 'Kas Internal' },
      { no: '4', item: 'Plakat Akrilik &amp; Sertifikat Frame', vol: '5', sat: 'Buah', unit: 'Rp 150.000', tot: 'Rp 750.000', src: 'Sponsorship' },
      { no: '5', item: 'Spanduk Banner Utama Ukuran 6x2 Meter', vol: '2', sat: 'Buah', unit: 'Rp 180.000', tot: 'Rp 360.000', src: 'Kas Internal' }
    ].map((row, i) => `
      <g transform="translate(110, ${325 + i * 78})">
        <rect x="0" y="0" width="1700" height="68" rx="12" fill="#FFFFFF" stroke="#2D232E" stroke-width="1.8" />
        <text x="40" y="42" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">${row.no}</text>
        <text x="120" y="42" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">${row.item}</text>
        <text x="680" y="42" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">${row.vol}</text>
        <text x="840" y="42" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">${row.sat}</text>
        <text x="1020" y="42" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">${row.unit}</text>
        <text x="1260" y="42" fill="#2D232E" font-family="'Syne', sans-serif" font-size="18" font-weight="800">${row.tot}</text>
        <text x="1480" y="42" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">${row.src}</text>
      </g>
    `).join('')}

    <!-- Total Row -->
    <g transform="translate(110, 725)">
      <rect x="0" y="0" width="1700" height="80" rx="14" fill="#FFF5BA" stroke="#2D232E" stroke-width="2.2" />
      <text x="120" y="50" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">TOTAL ESTIMASI ANGGARAN</text>
      <text x="1260" y="50" fill="#2D232E" font-family="'Syne', sans-serif" font-size="30" font-weight="800">Rp 11.110.000</text>
      <text x="1480" y="50" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="800">Rekapitulasi Bersih</text>
    </g>

    <!-- Twin Ticket Download Hotspot Strip -->
    <g transform="translate(110, 825)">
      <rect x="0" y="0" width="1700" height="105" rx="16" fill="#FFFFFF" stroke="#2D232E" stroke-width="2.2" />
      ${badgePill(40, 32, 280, 42, 'UNDUH TEMPLATE RESMI', '#FFB7B2', '#2D232E', 15)}
      <text x="350" y="58" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">bit.ly/MASTERDATABIROKEUANGAN</text>
      <text x="350" y="86" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">Template spreadsheet lengkap dengan rumus hitung otomatis terproteksi.</text>
    </g>

    ${createSvgFooter()}
  `),

  // 24: Berkas & Template SOP Lanjutan (Papan Pengumuman Memo Scrapbook + Washi Tape)
  () => wrapSvg(`
    ${createSvgHeader(24, 25, 'DOKUMEN KELENGKAPAN')}

    ${sticker(80, 115, 640, 46, 'BERKAS &amp; TEMPLATE SOP LANJUTAN', '#FFF5BA', 19)}
    <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Papan Memo Scrapbook Instrumen Standardisasi Administrasi Kas 2026</text>

    <!-- 6 Corkboard Notice Memo Cards with Washi Tape -->
    ${[
      { code: 'DOC-01', title: 'Serah Terima Kas', desc: 'Bukti fisik serah terima uang tunai antar-pengurus lengkap tanggal dan tanda tangan.', bg: '#FFB7B2', tape: '#E2F0CB' },
      { code: 'DOC-02', title: 'Tanda Terima Honor', desc: 'Bukti pembayaran narasumber/juri ber-NPWP sesuai pedoman pajak dekanat.', bg: '#FFF5BA', tape: '#FFDAC1' },
      { code: 'DOC-03', title: 'Verifikasi Kuitansi', desc: 'Lembaran kontrol verifikasi nota oleh staf sebelum berkas diarsipkan rapi.', bg: '#E8D7F5', tape: '#FFF5BA' },
      { code: 'DOC-04', title: 'Perjanjian Pinjaman', desc: 'Akad hukum peminjaman kas darurat dengan tenggat waktu dan sanksi terikat.', bg: '#FFDAC1', tape: '#FFB7B2' },
      { code: 'DOC-05', title: 'Buku Kas Harian', desc: 'Spreadsheet standar pencatatan debit/kredit dengan saldo mutasi otomatis.', bg: '#C7CEEA', tape: '#E2F0CB' },
      { code: 'DOC-06', title: 'Sampul LPJ Baku', desc: 'Format cover resmi LPJ Fakultas Pertanian UNPAD dengan standar baku.', bg: '#E2F0CB', tape: '#FFF5BA' }
    ].map((d, idx) => {
      const cx = 80 + (idx % 3) * 595;
      const cy = 230 + Math.floor(idx / 3) * 365;
      return `
        <g transform="translate(${cx}, ${cy})">
          ${washiTape(40, -10, 150, 24, (idx % 2 === 0 ? -3 : 3), d.tape)}
          ${card(0, 0, 570, 335, d.bg, 24, 5)}
          
          <rect x="30" y="30" width="510" height="275" rx="18" fill="#FFFFFF" stroke="#2D232E" stroke-width="2" />
          
          ${badgePill(50, 48, 130, 34, d.code, d.bg, '#2D232E', 15)}
          <text x="50" y="130" fill="#2D232E" font-family="'Syne', sans-serif" font-size="26" font-weight="800">${d.title}</text>
          
          <line x1="50" y1="155" x2="490" y2="155" stroke="#2D232E" stroke-width="1.8" />
          
          <text x="50" y="200" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
            ${wrapText(d.desc, 50, 200, 34, 28)}
          </text>

          <text x="50" y="280" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="800">
            Tersedia di: bit.ly/MASTERDATABIROKEUANGAN
          </text>
        </g>
      `;
    }).join('')}

    ${createSvgFooter()}
  `),

  // 25: Penutup (Tipografi Stiker Besar "THANK YOU" + Pin Lencana Segidelapan Penutup)
  () => wrapSvg(`
    <!-- Washi Tape Accents -->
    ${washiTape(240, 75, 180, 28, -4, '#FFB7B2')}
    ${washiTape(1500, 75, 180, 28, 4, '#E2F0CB')}

    <!-- Main Stage Frame -->
    ${card(110, 100, 1700, 880, '#FFFFFF', 32, 6)}

    <!-- Large Typography Sticker: THANK YOU -->
    <g transform="translate(440, 160)">
      <rect x="6" y="6" width="1040" height="140" rx="28" fill="#2D232E" />
      <rect x="0" y="0" width="1040" height="140" rx="28" fill="#FFB7B2" stroke="#2D232E" stroke-width="3.5" />
      <text x="520" y="96" fill="#2D232E" font-family="'Syne', sans-serif" font-size="88" font-weight="800" text-anchor="middle" letter-spacing="4">THANK YOU</text>
    </g>

    <text x="960" y="360" fill="#2D232E" font-family="'Syne', sans-serif" font-size="38" font-weight="800" text-anchor="middle">BIRO KEUANGAN BEM KMFP UNPAD 2026</text>
    <text x="960" y="410" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="22" font-weight="600" text-anchor="middle">&quot;Integritas dalam Tata Kelola, Loyalitas dalam Pelayanan&quot;</text>

    <line x1="260" y1="460" x2="1660" y2="460" stroke="#2D232E" stroke-width="3" />

    <!-- 3 Contact Cards -->
    <!-- 1. Sekretariat -->
    <g transform="translate(200, 490)">
      ${washiTape(120, -10, 160, 24, -2, '#FFF5BA')}
      ${card(0, 0, 460, 280, '#FFF5BA', 22, 5)}
      ${badgePill(35, 25, 190, 36, 'SEKRETARIAT', '#FFFFFF', '#2D232E', 15)}
      <text x="35" y="105" fill="#2D232E" font-family="'Syne', sans-serif" font-size="22" font-weight="800">Student Center KMFP</text>
      <text x="35" y="148" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">Fakultas Pertanian UNPAD</text>
      <text x="35" y="188" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">Jl. Raya Bandung-Sumedang Km 21</text>
      <text x="35" y="228" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">Jatinangor, Sumedang 45363</text>
    </g>

    <!-- 2. Master Data Online -->
    <g transform="translate(730, 490)">
      ${washiTape(120, -10, 160, 24, 1, '#FFDAC1')}
      ${card(0, 0, 460, 280, '#FFDAC1', 22, 5)}
      ${badgePill(35, 25, 220, 36, 'MASTER DATA ONLINE', '#FFFFFF', '#2D232E', 15)}
      <text x="35" y="105" fill="#2D232E" font-family="'Syne', sans-serif" font-size="20" font-weight="800">bit.ly/MASTERDATABIROKEUANGAN</text>
      <text x="35" y="148" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">Portal Seluruh Formulir Resmi</text>
      <text x="35" y="188" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">Template RAB, Kuitansi, dan SOP</text>
      <text x="35" y="228" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">Akses Daring Terbuka 24/7</text>
    </g>

    <!-- 3. Narahubung Resmi -->
    <g transform="translate(1260, 490)">
      ${washiTape(120, -10, 160, 24, -1, '#E2F0CB')}
      ${card(0, 0, 460, 280, '#E2F0CB', 22, 5)}
      ${badgePill(35, 25, 220, 36, 'NARAHUBUNG RESMI', '#FFFFFF', '#2D232E', 15)}
      <text x="35" y="105" fill="#2D232E" font-family="'Syne', sans-serif" font-size="22" font-weight="800">Kontak Pengurus 2026</text>
      <text x="35" y="148" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Calya Mei (Kabiro)</text>
      <text x="35" y="188" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">&#8226; Zahra Inaya (Wakabiro)</text>
      <text x="35" y="228" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17">Instagram: @bemkmfpunpad</text>
    </g>

    <!-- Pin Lencana Segidelapan Penutup di Bagian Tengah Bawah -->
    ${badgeOctagon(960, 845, 190, 'BIRO KEUANGAN', '#FFF5BA')}
    <text x="960" y="872" fill="#2D232E" font-family="'Syne', sans-serif" font-size="14" font-weight="800" text-anchor="middle">BEM KMFP UNPAD 2026</text>

    ${createSvgFooter()}
  `)
];

async function main() {
  console.log('[START] Memulai pembangkitan 25 aset mentah slide Soft Neo-Brutalism + Digital Scrapbook');
  await ensureDir(slidesDir);

  for (let i = 0; i < slideGenerators.length; i++) {
    const slideNumber = i + 1;
    const fileName = `slide ${slideNumber}.png`;
    const filePath = path.join(slidesDir, fileName);

    const svgContent = slideGenerators[i]();
    const pngBuffer = await sharp(Buffer.from(svgContent))
      .resize(1920, 1080)
      .png({ compressionLevel: 8 })
      .toBuffer();

    await fs.writeFile(filePath, pngBuffer);
    const sizeKb = (pngBuffer.length / 1024).toFixed(2);
    console.log(`[GENERATE] Slide ${String(slideNumber).padStart(2, '0')}/25 tersimpan: ${fileName} (${sizeKb} KB)`);
  }

  console.log('[FINISH] Seluruh 25 berkas mentah slide berhasil disiapkan di raw-assets/slides');
}

main().catch(err => {
  console.error('[ERROR] Terjadi kegagalan pembangkitan slide:', err.message);
  process.exit(1);
});
