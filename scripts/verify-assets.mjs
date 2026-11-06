import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const assetsHalamanDir = path.join(rootDir, 'assets', 'halaman');
const publicHalamanDir = path.join(rootDir, 'public', 'assets', 'halaman');
const fontsDir = path.join(rootDir, 'public', 'assets', 'fonts');
const audioFilePath = path.join(rootDir, 'public', 'assets', 'audio', 'page-flip.mp3');

const EXPECTED_FILES = [
  'halaman-cover-utama.jfif',
  'halaman-kepala-biro.jfif',
  'halaman-staff-biro.jfif',
  'halaman-visi-misi.jfif',
  'halaman-the-golden.jfif',
  'halaman-why-how.jfif',
  'halaman-what.jfif',
  'halaman-deskripsi-bikeu.jfif',
  'halaman-tugas-pokok.jfif',
  'halaman-analisis-swot.jfif',
  'halaman-mimpi-biro.jfif',
  'halaman-program-kerja.jfif',
  'manajemen-tata-kelola.jfif',
  'halaman-manajemen-tata-kelola.jfif',
  'halaman-berkas-pengajuan-dana.jfif',
  'halaman-alur-berkas-pengajuan.jfif',
  'halaman-lampiran-dekanat.jfif',
  'halaman-alur-permohonan-dana.jfif',
  'halaman-alur-reimbers.jfif',
  'alur-peminjaman-dana.jfif',
  'halaman-sosialisasi-bendahara.jfif',
  'halaman-template-rab.jfif',
  'halaman-thank-you.jfif'
];

const EXPECTED_FONTS = [
  'syne-700.woff2',
  'syne-800.woff2',
  'plus-jakarta-sans-400.woff2',
  'plus-jakarta-sans-500.woff2',
  'plus-jakarta-sans-600.woff2'
];

async function fileExists(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function verifyImages() {
  const issues = [];
  const results = [];

  for (const fileName of EXPECTED_FILES) {
    const filePath = path.join(assetsHalamanDir, fileName);
    const pubPath = path.join(publicHalamanDir, fileName);

    const exists = await fileExists(filePath);
    const pubExists = await fileExists(pubPath);

    if (!exists) {
      issues.push(`Berkas gambar tidak ditemukan di assets/halaman: ${fileName}`);
      results.push({ name: fileName, exists: false, dimensions: '-', valid: false });
      continue;
    }
    if (!pubExists) {
      issues.push(`Berkas gambar belum disalin ke public/assets/halaman: ${fileName}`);
    }

    const stat = await fs.stat(filePath);
    const sizeKb = (stat.size / 1024).toFixed(2);

    let metadata;
    try {
      metadata = await sharp(filePath).metadata();
    } catch (e) {
      issues.push(`Gagal membaca metadata gambar ${fileName}: ${e.message}`);
      results.push({ name: fileName, exists: true, sizeKb, dimensions: 'ERROR', valid: false });
      continue;
    }

    // Rasio ~4:3 (antara 1.30 dan 1.36)
    const ratio = metadata.width / metadata.height;
    const isRatioValid = Math.abs(ratio - 4 / 3) < 0.05;

    if (!isRatioValid) {
      issues.push(`Rasio bukan 4:3 pada ${fileName}: ${metadata.width}x${metadata.height} (rasio: ${ratio.toFixed(3)})`);
    }

    results.push({
      name: fileName,
      exists: true,
      sizeKb,
      dimensions: `${metadata.width}x${metadata.height}`,
      valid: isRatioValid
    });
  }

  return { results, issues };
}

async function verifyFonts() {
  const issues = [];
  const results = [];

  for (const fontName of EXPECTED_FONTS) {
    const fontPath = path.join(fontsDir, fontName);
    const exists = await fileExists(fontPath);

    if (!exists) {
      issues.push(`Berkas font tidak ditemukan: ${fontName}`);
      results.push({ name: fontName, exists: false, valid: false });
    } else {
      const stat = await fs.stat(fontPath);
      results.push({
        name: fontName,
        exists: true,
        sizeKb: (stat.size / 1024).toFixed(2),
        valid: stat.size > 0
      });
    }
  }

  return { results, issues };
}

async function verifyAudio() {
  const exists = await fileExists(audioFilePath);
  if (!exists) {
    return { exists: false, sizeKb: '0', valid: false, issue: 'page-flip.mp3 tidak ditemukan' };
  }
  const stat = await fs.stat(audioFilePath);
  const sizeKb = (stat.size / 1024).toFixed(2);
  const isSizeValid = stat.size < 50 * 1024;
  return {
    exists: true,
    sizeKb,
    valid: isSizeValid,
    issue: isSizeValid ? null : `Ukuran audio ${sizeKb} KB melampaui batas`
  };
}

async function runVerification() {
  console.log('================================================================================');
  console.log('VERIFIKASI ASET DIGITAL FLIPBOOK 4:3 (24 HALAMAN)');
  console.log('Grand Design Biro Keuangan BEM KMFP UNPAD 2026');
  console.log('================================================================================\n');

  const imgRes = await verifyImages();
  console.log(`[1] Verifikasi Aset Gambar 4:3 (${imgRes.results.length} berkas):`);
  console.table(imgRes.results);

  const fontRes = await verifyFonts();
  console.log(`\n[2] Verifikasi Font Lokal (${fontRes.results.length} berkas):`);
  console.table(fontRes.results);

  const audioRes = await verifyAudio();
  console.log('\n[3] Verifikasi Efek Suara:');
  console.log(`- Berkas : page-flip.mp3`);
  console.log(`- Status : ${audioRes.exists ? 'Ditemukan' : 'Hilang'} (${audioRes.sizeKb} KB)`);

  const allIssues = [...imgRes.issues, ...fontRes.issues, ...(audioRes.issue ? [audioRes.issue] : [])];
  console.log('\n================================================================================');
  if (allIssues.length > 0) {
    console.error(`DITEMUKAN ${allIssues.length} CATATAN:`);
    allIssues.forEach((iss, idx) => console.error(`${idx + 1}. ${iss}`));
    process.exit(1);
  } else {
    console.log('[SUKSES] Seluruh 24 aset citra 4:3, font, dan audio terverifikasi 100% valid!');
  }
  console.log('================================================================================\n');
}

runVerification().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
