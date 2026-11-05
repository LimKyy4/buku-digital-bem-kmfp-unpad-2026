import fs from 'node:fs/promises';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import lamejs from '@breezystack/lamejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const audioDir = path.join(rootDir, 'public', 'assets', 'audio');
const outputFilePath = path.join(audioDir, 'background-music.mp3');
const distAudioDir = path.join(rootDir, 'dist', 'assets', 'audio');
const distFilePath = path.join(distAudioDir, 'background-music.mp3');

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Generator musik latar lo-fi ambient akustik yang menenangkan dan estetis.
 * Durasi: ~25.6 detik, mulus dan dapat diulang tanpa jeda (loopable).
 */
function synthesizeBackgroundMusic() {
  const sampleRate = 44100;
  const bpm = 75;
  const beatSec = 60 / bpm;
  const totalDuration = 8 * 4 * beatSec; // 8 bar = 25.6 detik
  const totalSamples = Math.floor(sampleRate * totalDuration);
  const samples = new Int16Array(totalSamples);

  // Progresi akor jazz/lo-fi lembut: Fmaj7 -> Em7 -> Dm7 -> Cmaj7 (2 putaran)
  const chords = [
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [164.81, 196.00, 246.94, 293.66], // Em7
    [146.83, 174.61, 220.00, 261.63], // Dm7
    [130.81, 164.81, 196.00, 246.94], // Cmaj7
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [164.81, 196.00, 246.94, 293.66], // Em7
    [146.83, 174.61, 220.00, 261.63], // Dm7
    [130.81, 164.81, 196.00, 246.94]  // Cmaj7
  ];

  const barDuration = 4 * beatSec;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const barIndex = Math.min(chords.length - 1, Math.floor(t / barDuration));
    const chord = chords[barIndex];
    const barTime = t % barDuration;

    let val = 0;

    // Arpeggio nada lembut elektrik piano / kotak musik
    chord.forEach((freq, idx) => {
      const noteDelay = idx * (beatSec * 0.5);
      if (barTime >= noteDelay) {
        const noteTime = barTime - noteDelay;
        const env = Math.exp(-noteTime * 1.6) * Math.min(1, noteTime * 60);
        const osc = Math.sin(2 * Math.PI * freq * noteTime) * 0.65 +
                    Math.sin(2 * Math.PI * freq * 2 * noteTime) * 0.22 +
                    Math.sin(2 * Math.PI * freq * 3 * noteTime) * 0.08;
        val += osc * env * 0.20;
      }
    });

    // Petikan bass hangat
    const bassFreq = chord[0] / 2;
    const bassBeatTime = barTime % (2 * beatSec);
    const bassEnv = Math.exp(-bassBeatTime * 2.0) * Math.min(1, bassBeatTime * 40);
    val += Math.sin(2 * Math.PI * bassFreq * bassBeatTime) * bassEnv * 0.26;

    // Desir lo-fi vinyl lembut di latar
    const vinylCrack = (Math.random() * 2 - 1) * 0.015;
    val += vinylCrack;

    // Seamless loop master crossfade di ujung awal dan akhir
    const fadeSec = 0.4;
    let masterFade = 1;
    if (t < fadeSec) masterFade = t / fadeSec;
    else if (t > totalDuration - fadeSec) masterFade = (totalDuration - t) / fadeSec;

    const clamped = Math.max(-1, Math.min(1, val * masterFade * 1.35));
    samples[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
  }

  const Mp3Encoder = lamejs.Mp3Encoder || lamejs.default.Mp3Encoder;
  const encoder = new Mp3Encoder(1, sampleRate, 128);
  const chunks = [];
  const mp3buf = encoder.encodeBuffer(samples);
  if (mp3buf.length > 0) chunks.push(Buffer.from(mp3buf));
  const flushed = encoder.flush();
  if (flushed.length > 0) chunks.push(Buffer.from(flushed));

  return Buffer.concat(chunks);
}

async function main() {
  console.log('[START] Menyiapkan musik latar MP3 (background-music.mp3)');
  await ensureDir(audioDir);

  const mp3Buffer = synthesizeBackgroundMusic();
  await fs.writeFile(outputFilePath, mp3Buffer);
  console.log(`[GENERATED] public/assets/audio/background-music.mp3 (${(mp3Buffer.length / 1024).toFixed(1)} KB)`);

  if (existsSync(distAudioDir)) {
    writeFileSync(distFilePath, mp3Buffer);
    console.log(`[SYNC] dist/assets/audio/background-music.mp3 (${(mp3Buffer.length / 1024).toFixed(1)} KB)`);
  }
}

main().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
