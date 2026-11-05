import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import lamejs from '@breezystack/lamejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const audioDir = path.join(rootDir, 'public', 'assets', 'audio');
const outputFilePath = path.join(audioDir, 'page-flip.mp3');

const MAX_SIZE_BYTES = 30 * 1024; // 30 KB
const MAX_DURATION_SECONDS = 0.5;

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Generator efek suara pembalik kertas (page-flip) fisik minimalis berpresisi tinggi.
 * Menghasilkan interaksi gesekan kertas, hembusan udara, dan defleksi lentur lembaran.
 */
function synthesizePageFlipAudio() {
  const sampleRate = 44100;
  const duration = 0.28; // 280 milidetik, di bawah 0.5 detik
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Int16Array(numSamples);

  // Bandpass state untuk simulasi resonansi kertas
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Amplop eksponensial dengan serangan cepat (attack) dan peluruhan halus (decay)
    const attack = Math.min(1, t / 0.02);
    const decay = Math.pow(1 - progress, 2.5);
    const envelope = attack * decay;

    // Komponen 1: Desir gesekan kertas (White & Pink noise berfilter)
    const whiteNoise = (Math.random() * 2 - 1);
    b0 = 0.95 * b0 + whiteNoise * 0.05;
    b1 = 0.85 * b1 + whiteNoise * 0.15;
    b2 = 0.70 * b2 + whiteNoise * 0.30;
    const frictionNoise = (whiteNoise * 0.35 + b0 * 0.3 + b1 * 0.2 + b2 * 0.15);

    // Komponen 2: Hembusan udara dinamis saat kertas melengkung (air sweep)
    const sweepFreq = 1800 - progress * 900;
    const airWhoosh = Math.sin(2 * Math.PI * sweepFreq * t) * 0.22;

    // Komponen 3: Lenturan fisik ketukan awal ujung jari (thump/flutter)
    const flexFreq = 160 - progress * 70;
    const flexThump = Math.sin(2 * Math.PI * flexFreq * t) * 0.35 * Math.exp(-t * 35);

    // Variasi getaran mikro lembaran kertas
    const flutterMod = 1 + 0.18 * Math.sin(2 * Math.PI * 45 * t);

    // Gabungkan seluruh lapisan komponen akustik
    const combined = (frictionNoise * 0.55 + airWhoosh * 0.25 + flexThump * 0.20) * envelope * flutterMod;

    // Normalisasi dan pembatasan (clamping) aman 16-bit PCM
    const clamped = Math.max(-1, Math.min(1, combined * 1.4));
    samples[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
  }

  // Encoding ke MP3 format 128 kbps CBR Mono
  const encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
  const mp3Chunks = [];
  
  const mp3buf = encoder.encodeBuffer(samples);
  if (mp3buf.length > 0) {
    mp3Chunks.push(Buffer.from(mp3buf));
  }
  
  const flushed = encoder.flush();
  if (flushed.length > 0) {
    mp3Chunks.push(Buffer.from(flushed));
  }

  return Buffer.concat(mp3Chunks);
}

async function main() {
  console.log('[START] Memulai pengadaan berkas audio efek pembalik kertas (page-flip.mp3)');
  await ensureDir(audioDir);

  console.log('[GENERATE] Menjalankan generator audio akustik pembalik kertas (durasi 0.28s)');
  const mp3Buffer = synthesizePageFlipAudio();

  const fileSizeBytes = mp3Buffer.length;
  const fileSizeKb = (fileSizeBytes / 1024).toFixed(2);

  if (fileSizeBytes > MAX_SIZE_BYTES) {
    throw new Error(`Ukuran berkas melebihi batas 30 KB: ${fileSizeKb} KB`);
  }

  await fs.writeFile(outputFilePath, mp3Buffer);
  console.log(`[SUCCESS] Berkas audio tersimpan: ${path.relative(rootDir, outputFilePath)}`);
  console.log(`[INFO] Ukuran berkas: ${fileSizeBytes} bytes (${fileSizeKb} KB) - Toleransi < 30 KB: VALID`);
  console.log('[FINISH] Pengadaan audio pembalik kertas selesai');
}

main().catch(err => {
  console.error('[ERROR] Terjadi kegagalan pada skrip setup-audio:', err.message);
  process.exit(1);
});
