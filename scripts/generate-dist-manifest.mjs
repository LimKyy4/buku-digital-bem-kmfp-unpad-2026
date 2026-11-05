import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const distDir = path.resolve('dist');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(full));
    } else {
      const buf = fs.readFileSync(full);
      const sha = crypto.createHash('sha1').update(buf).digest('hex');
      const rel = path.relative(distDir, full).split(path.sep).join('/');
      results.push({ file: rel, sha, size: stat.size });
    }
  }
  return results;
}

const all = getFiles(distDir);
console.log('Total files:', all.length);
console.log('Total bytes:', all.reduce((a, b) => a + b.size, 0));
fs.writeFileSync('dist-manifest.json', JSON.stringify(all, null, 2));
