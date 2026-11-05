import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#064E3B"/>
  <circle cx="32" cy="32" r="24" fill="none" stroke="#F59E0B" stroke-width="3"/>
  <text x="32" y="40" font-family="sans-serif" font-size="22" font-weight="900" fill="#10B981" text-anchor="middle">BK</text>
</svg>`;

await sharp(Buffer.from(svg)).resize(32, 32).png().toFile('public/favicon.ico');
console.log('[SUCCESS] Favicon resmi berhasil dibuat di public/favicon.ico');
