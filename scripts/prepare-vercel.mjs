import { cp, mkdir, readdir, copyFile } from 'node:fs/promises';
// Keep .vercel project linkage across releases; only copy build outputs.
await mkdir('deploy-vercel', { recursive: true });
for (const entry of await readdir('dist', { withFileTypes: true })) {
  if (['CNAME', '.nojekyll', 'scene.png', 'og.png'].includes(entry.name)) continue;
  await cp(`dist/${entry.name}`, `deploy-vercel/${entry.name}`, { recursive: true });
}
await copyFile('vercel.static.json', 'deploy-vercel/vercel.json');
console.log('Prepared deploy-vercel/ for a static Vercel deployment.');
