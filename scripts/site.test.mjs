import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
test('static release is complete and stays on the owned domain', async () => {
  const html = await readFile('dist/index.html','utf8');
  assert.match(html,/今天，想从哪里聊起/);
  assert.match(html,/预设回复的交互演示/);
  assert.match(html,/https:\/\/still\.prayert\.cn\/og\.jpg/);
  for (const m of html.matchAll(/(?:src|href)="(\/[^" ]+\.(?:js|css))"/g)) assert.ok((await stat(join('dist',m[1]))).size>0);
  const files = await readdir('dist/assets');
  const text = html + (await Promise.all(files.filter(f=>/\.(js|css)$/.test(f)).map(f=>readFile(join('dist/assets',f),'utf8')))).join('');
  assert.doesNotMatch(text,/chatgpt\.site|chatgpt-team\.site|signin-with-chatgpt|codex-preview|appgprj_|localhost:3000/i);
  assert.equal((await readFile('dist/CNAME','utf8')).trim(),'still.prayert.cn');
});
test('English is rendered before JavaScript and has localized metadata', async () => {
  const html = await readFile('dist/en/index.html', 'utf8');
  assert.match(html, /<html lang="en">/);
  assert.match(html, /Where shall we begin/);
  assert.match(html, /Preset replies/);
  assert.match(html, /https:\/\/still\.prayert\.cn\/en\//);
  assert.doesNotMatch(html.replaceAll('切换到中文', '').replaceAll('中文', ''), /[\u3400-\u9fff]/);
});
test('first-paint images have small responsive variants and no full PNG references', async () => {
  const html = await readFile('dist/index.html', 'utf8');
  assert.match(html, /<picture/);
  assert.match(html, /scene-480\.webp/);
  assert.match(html, /fetchPriority="high"|fetchpriority="high"/);
  assert.doesNotMatch(html, /scene\.png|og\.png/);
  for (const [file, limit] of [['scene-480.webp', 30000], ['scene-960.webp', 80000], ['avatar.webp', 4000], ['og.jpg', 120000]]) {
    assert.ok((await stat('dist/' + file)).size < limit, file + ' exceeds transfer budget');
  }
});
