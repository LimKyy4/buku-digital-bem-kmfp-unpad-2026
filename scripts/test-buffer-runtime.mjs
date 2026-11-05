import esbuild from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function testBufferRuntime() {
  console.log('[TEST] Menjalankan pengujian runtime AdaptiveBufferManager 24 Halaman...');

  const result = await esbuild.build({
    entryPoints: [path.join(rootDir, 'src', 'core', 'AdaptiveBufferManager.ts')],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    target: 'node20'
  });

  const code = result.outputFiles[0].text;
  const module = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  const { AdaptiveBufferManager } = module;

  const mockUrls = Array.from({ length: 24 }, (_, i) => `/assets/halaman/halaman-${String(i + 1).padStart(2, '0')}.jfif`);

  const buffer = new AdaptiveBufferManager(mockUrls, 2);

  // 1. Pada posisi membaca Cover (halaman 0), halaman 0, 1, 2 harus url asli, halaman 3-22 harus placeholder, halaman 23 (back cover) tetap url asli
  const bufferedAt0 = buffer.getBufferedUrls(0);
  if (bufferedAt0.length !== 24) throw new Error('Total buffered urls bukan 24');
  if (bufferedAt0[0] !== mockUrls[0]) throw new Error('Halaman 0 harus url asli');
  if (bufferedAt0[1] !== mockUrls[1]) throw new Error('Halaman 1 harus url asli');
  if (bufferedAt0[2] !== mockUrls[2]) throw new Error('Halaman 2 harus url asli');
  if (bufferedAt0[3] !== AdaptiveBufferManager.PLACEHOLDER_DATA_URI) throw new Error('Halaman 3 harus placeholder');
  if (bufferedAt0[10] !== AdaptiveBufferManager.PLACEHOLDER_DATA_URI) throw new Error('Halaman 10 harus placeholder');
  if (bufferedAt0[23] !== mockUrls[23]) throw new Error('Halaman 23 (cover belakang) harus selalu url asli');
  console.log('[PASS] Buffer pada posisi awal (indeks 0) membatasi URL aktif dan menggunakan placeholder.');

  // 2. Pada posisi membaca Halaman 10 (indeks 9), halaman 7 s/d 11 harus url asli
  const bufferedAt9 = buffer.getBufferedUrls(9);
  if (bufferedAt9[9] !== mockUrls[9]) throw new Error('Halaman 9 harus url asli');
  if (bufferedAt9[7] !== mockUrls[7]) throw new Error('Halaman 7 harus url asli (radius 2)');
  if (bufferedAt9[11] !== mockUrls[11]) throw new Error('Halaman 11 harus url asli (radius 2)');
  if (bufferedAt9[5] !== AdaptiveBufferManager.PLACEHOLDER_DATA_URI) throw new Error('Halaman 5 harus placeholder');
  if (bufferedAt9[15] !== AdaptiveBufferManager.PLACEHOLDER_DATA_URI) throw new Error('Halaman 15 harus placeholder');
  console.log('[PASS] Buffer pada posisi tengah (indeks 9) membatasi URL aktif ke radius 2.');

  // 3. Test isPageBuffered
  if (!buffer.isPageBuffered(9, 9)) throw new Error('isPageBuffered(9, 9) harus true');
  if (!buffer.isPageBuffered(11, 9)) throw new Error('isPageBuffered(11, 9) harus true');
  if (buffer.isPageBuffered(15, 9)) throw new Error('isPageBuffered(15, 9) harus false');
  console.log('[PASS] isPageBuffered berfungsi dengan presisi.');

  console.log('[SUCCESS] Seluruh pengujian logika runtime AdaptiveBufferManager berhasil 100%.');
}

testBufferRuntime().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
