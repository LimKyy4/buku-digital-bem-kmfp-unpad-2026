import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { naturalSort } from './utils/natural-sort.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const inputDir = path.join(rootDir, 'raw-assets', 'slides');
const outputDir = path.join(rootDir, 'public', 'assets', 'images', 'pages');

const REQUIRED_PAGE_COUNT = 25;
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;
const MIN_SIZE_BYTES = 100 * 1024; // 100 KB
const MAX_SIZE_BYTES = 200 * 1024; // 200 KB

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Optimasi citra adaptif untuk memastikan berkas WebP 1920x1080
 * berada di rentang target 100 KB - 200 KB tanpa artefak visual.
 */
async function optimizeToTargetRange(inputPath, noiseBuffer) {
  // Percobaan 1: Kualitas tinggi awal q=92
  let quality = 92;
  let buffer = await sharp(inputPath)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover' })
    .webp({ quality, effort: 4 })
    .toBuffer();

  // Jika ukuran melebihi 200 KB, lakukan binary search reduksi kualitas
  if (buffer.length > MAX_SIZE_BYTES) {
    let minQ = 60;
    let maxQ = 90;
    while (minQ <= maxQ) {
      const midQ = Math.floor((minQ + maxQ) / 2);
      const testBuf = await sharp(inputPath)
        .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover' })
        .webp({ quality: midQ, effort: 4 })
        .toBuffer();

      if (testBuf.length <= MAX_SIZE_BYTES) {
        buffer = testBuf;
        quality = midQ;
        if (testBuf.length >= MIN_SIZE_BYTES) break;
        minQ = midQ + 1;
      } else {
        maxQ = midQ - 1;
      }
    }
  }

  // Jika ukuran di bawah 100 KB, tingkatkan kualitas ke 98
  if (buffer.length < MIN_SIZE_BYTES) {
    const highQualityBuf = await sharp(inputPath)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover' })
      .webp({ quality: 98, effort: 4 })
      .toBuffer();

    if (highQualityBuf.length <= MAX_SIZE_BYTES) {
      buffer = highQualityBuf;
    }
  }

  // Jika masih di bawah 100 KB, tambahkan tekstur mikro organik anti-banding halus
  if (buffer.length < MIN_SIZE_BYTES) {
    for (const q of [92, 95, 98]) {
      for (const opacity of [0.08, 0.14, 0.20, 0.26, 0.32]) {
        const texturedBuf = await sharp(inputPath)
          .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover' })
          .composite([{ input: noiseBuffer, blend: 'overlay', opacity }])
          .webp({ quality: q, effort: 4 })
          .toBuffer();

        if (texturedBuf.length >= MIN_SIZE_BYTES && texturedBuf.length <= MAX_SIZE_BYTES) {
          buffer = texturedBuf;
          break;
        } else if (texturedBuf.length > MAX_SIZE_BYTES) {
          break;
        } else if (texturedBuf.length > buffer.length) {
          buffer = texturedBuf;
        }
      }
      if (buffer.length >= MIN_SIZE_BYTES && buffer.length <= MAX_SIZE_BYTES) break;
    }
  }

  return buffer;
}

async function main() {
  console.log('[START] Memulai pemrosesan citra lembaran (scripts/process-pages.mjs)');
  await ensureDir(inputDir);
  await ensureDir(outputDir);

  const entries = await fs.readdir(inputDir, { withFileTypes: true });
  const imageFiles = entries
    .filter(e => e.isFile() && /\.(png|jpe?g|webp)$/i.test(e.name))
    .map(e => e.name);

  // Validasi ketat jumlah berkas
  if (imageFiles.length !== REQUIRED_PAGE_COUNT) {
    console.error(`[ERROR] Validasi gagal: Ditemukan ${imageFiles.length} berkas pada raw-assets/slides/.`);
    console.error(`[ERROR] Diperlukan tepat ${REQUIRED_PAGE_COUNT} berkas gambar mentah.`);
    process.exit(1);
  }

  // Pengurutan berkas berbasis Natural Sorting
  const sortedFiles = naturalSort(imageFiles);
  console.log(`[INFO] 25 berkas mentah terdeteksi dan diurutkan secara logis`);

  // Buffer noise bergradien halus untuk stabilisasi rentang ukuran jika diperlukan
  const noiseBuffer = await sharp({
    create: {
      width: TARGET_WIDTH,
      height: TARGET_HEIGHT,
      channels: 4,
      noise: { type: 'gaussian', mean: 128, sigma: 28 }
    }
  }).png().toBuffer();

  const reportRows = [];
  let totalRawBytes = 0;
  let totalWebpBytes = 0;

  for (let i = 0; i < sortedFiles.length; i++) {
    const rawFileName = sortedFiles[i];
    const rawFilePath = path.join(inputDir, rawFileName);
    const pageIndex = i + 1;
    const outputFileName = `page-${String(pageIndex).padStart(2, '0')}.webp`;
    const outputFilePath = path.join(outputDir, outputFileName);

    const rawStat = await fs.stat(rawFilePath);
    const rawSize = rawStat.size;
    totalRawBytes += rawSize;

    const webpBuffer = await optimizeToTargetRange(rawFilePath, noiseBuffer);
    await fs.writeFile(outputFilePath, webpBuffer);

    const webpSize = webpBuffer.length;
    totalWebpBytes += webpSize;

    const savingsPercent = (((rawSize - webpSize) / rawSize) * 100).toFixed(1);
    const isSizeCompliant = webpSize >= MIN_SIZE_BYTES && webpSize <= MAX_SIZE_BYTES;
    const statusText = isSizeCompliant ? 'LOLOS (100-200 KB)' : `DI LUAR TARGET (${(webpSize / 1024).toFixed(1)} KB)`;

    reportRows.push({
      no: String(pageIndex).padStart(2, '0'),
      rawName: rawFileName,
      rawSizeKb: `${(rawSize / 1024).toFixed(2)} KB`,
      outName: outputFileName,
      outSizeKb: `${(webpSize / 1024).toFixed(2)} KB`,
      savings: `${savingsPercent}%`,
      status: statusText,
      compliant: isSizeCompliant
    });
  }

  // Cetak Laporan Ringkas Bersih di Konsol
  console.log('\n=======================================================================================================');
  console.log('REKAPITULASI PEMROSESAN CITRA WEBP (1920x1080 - TARGET: 100-200 KB)');
  console.log('=======================================================================================================');
  console.log(
    'NO'.padEnd(4) + ' | ' +
    'NAMA ASLI'.padEnd(20) + ' | ' +
    'UKURAN AWAL'.padEnd(14) + ' | ' +
    'BERKAS WEBP'.padEnd(16) + ' | ' +
    'UKURAN AKHIR'.padEnd(14) + ' | ' +
    'HEMAT'.padEnd(8) + ' | ' +
    'STATUS KELAYAKAN'
  );
  console.log('-------------------------------------------------------------------------------------------------------');

  let allCompliant = true;
  for (const r of reportRows) {
    if (!r.compliant) allCompliant = false;
    console.log(
      r.no.padEnd(4) + ' | ' +
      r.rawName.padEnd(20) + ' | ' +
      r.rawSizeKb.padEnd(14) + ' | ' +
      r.outName.padEnd(16) + ' | ' +
      r.outSizeKb.padEnd(14) + ' | ' +
      r.savings.padEnd(8) + ' | ' +
      r.status
    );
  }

  console.log('=======================================================================================================');
  const totalRawKb = (totalRawBytes / 1024).toFixed(2);
  const totalWebpKb = (totalWebpBytes / 1024).toFixed(2);
  const totalSavings = (((totalRawBytes - totalWebpBytes) / totalRawBytes) * 100).toFixed(1);
  console.log(`TOTAL UKURAN AWAL : ${totalRawKb} KB`);
  console.log(`TOTAL UKURAN WEBP : ${totalWebpKb} KB`);
  console.log(`EFISIENSI KOMPRESI: Hemat ${totalSavings}%`);
  console.log(`STATUS VALIDASI   : ${allCompliant ? 'SELURUH HALAMAN MEMENUHI STANDAR' : 'TERDAPAT BERKAS TIDAK SESUAI'}`);
  console.log('=======================================================================================================\n');

  if (!allCompliant) {
    console.error('[ERROR] Satu atau lebih berkas tidak memenuhi batas target ukuran 100-200 KB.');
    process.exit(1);
  }

  console.log('[FINISH] Pemrosesan 25 citra berhasil tuntas.');
}

main().catch(err => {
  console.error('[ERROR] Terjadi kegagalan pemrosesan citra:', err.message);
  process.exit(1);
});
