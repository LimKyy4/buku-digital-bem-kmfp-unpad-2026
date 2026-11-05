/**
 * Utilitas Rotasi Acak Deterministik untuk Estetika Scrapbook Y2K
 * Menghasilkan derajat rotasi mikro yang konsisten (-3° s/d 3°)
 * berdasarkan seed indeks atau string ID, menjaga konsistensi visual
 * tanpa ketidakteraturan render acak saat reload halaman.
 */

/**
 * Menghitung nilai hash 32-bit deterministik dari input string atau angka
 */
export function hashSeed(seed: string | number): number {
  const str = String(seed);
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

/**
 * Menghasilkan rotasi sudut derajat kemiringan scrapbook secara deterministik
 * @param seed Penanda unik elemen (indeks atau nama ID)
 * @param minDeg Batas sudut minimum (default: -2.5 derajat)
 * @param maxDeg Batas sudut maksimum (default: 2.5 derajat)
 * @returns Nilai rotasi floating point dengan presisi 2 desimal
 */
export function getDeterministicRotation(
  seed: string | number,
  minDeg: number = -2.5,
  maxDeg: number = 2.5
): number {
  const normalized = hashSeed(seed);
  const rotation = minDeg + normalized * (maxDeg - minDeg);
  return Math.round(rotation * 100) / 100;
}

/**
 * Memilih warna pastel Dream secara bergantian berdasarkan seed
 */
export function getDeterministicColor(
  seed: string | number,
  palette: string[] = ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#FFF5BA', '#E8D7F5', '#C7CEEA']
): string {
  const normalized = hashSeed(seed);
  const index = Math.floor(normalized * palette.length);
  return palette[index % palette.length];
}
