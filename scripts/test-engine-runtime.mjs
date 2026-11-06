import esbuild from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function transpileTs(filePath) {
  const result = await esbuild.build({
    entryPoints: [filePath],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    target: 'node20'
  });
  const code = result.outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

async function testEngineRuntime() {
  console.log('[TEST] Menjalankan pengujian runtime ResponsiveManager dan bookConfig 4:3...');

  const configModule = await transpileTs(path.join(rootDir, 'src', 'config', 'bookConfig.ts'));
  const respModule = await transpileTs(path.join(rootDir, 'src', 'core', 'ResponsiveManager.ts'));

  const { ResponsiveManager } = respModule;
  const { defaultBookConfig, ASPECT_RATIO, BASE_PAGE_WIDTH, BASE_PAGE_HEIGHT } = configModule;

  // 1. Validasi parameter bookConfig 4:3
  if (Math.abs(ASPECT_RATIO - 4 / 3) > 0.01) throw new Error('Rasio aspek bukan 4:3');
  if (BASE_PAGE_WIDTH !== 800) throw new Error('BASE_PAGE_WIDTH bukan 800');
  if (BASE_PAGE_HEIGHT !== 600) throw new Error('BASE_PAGE_HEIGHT bukan 600');
  if (defaultBookConfig.showCover !== true) throw new Error('showCover harus true');
  if (defaultBookConfig.drawShadow !== true) throw new Error('drawShadow harus true');
  console.log('[PASS] bookConfig 4:3 runtime parameters valid.');

  // 2. Validasi ResponsiveManager bounds calculation
  const rm = new ResponsiveManager();
  const mockDesktopContainer = { clientWidth: 1920, clientHeight: 1080 };
  const desktopBounds = rm.calculateStageBounds(mockDesktopContainer);

  if (desktopBounds.width <= 0 || desktopBounds.height <= 0) {
    throw new Error('Kalkulasi desktop bounds menghasilkan dimensi tidak valid');
  }
  const desktopRatio = desktopBounds.width / desktopBounds.height;
  const expectedDesktopRatio = rm.getMode() === 'spread' ? (4 / 3) * 2 : 4 / 3;
  if (Math.abs(desktopRatio - expectedDesktopRatio) > 0.05) {
    throw new Error(`Rasio spread desktop tidak sesuai: ${desktopRatio} vs ${expectedDesktopRatio}`);
  }
  console.log(`[PASS] Desktop stage bounds: ${desktopBounds.width}x${desktopBounds.height} (ratio: ${desktopRatio.toFixed(3)}, scale: ${desktopBounds.scale.toFixed(2)})`);

  console.log('[SUCCESS] Seluruh pengujian runtime Core Engine berhasil 100%.');
}

testEngineRuntime().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
