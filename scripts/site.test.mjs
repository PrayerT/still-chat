import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
test('static release is complete and stays on the owned domain', async () => {
  const html = await readFile('dist/index.html','utf8');
  assert.match(html,/今天，想从哪里聊起/);
  assert.match(html,/预设回复的交互演示/);
  assert.match(html,/https:\/\/still\.prayert\.cn\/og\.png/);
  for (const m of html.matchAll(/(?:src|href)="(\/[^" ]+\.(?:js|css))"/g)) assert.ok((await stat(join('dist',m[1]))).size>0);
  const files = await readdir('dist/assets');
  const text = html + (await Promise.all(files.filter(f=>/\.(js|css)$/.test(f)).map(f=>readFile(join('dist/assets',f),'utf8')))).join('');
  assert.doesNotMatch(text,/chatgpt\.site|chatgpt-team\.site|signin-with-chatgpt|codex-preview|appgprj_|localhost:3000/i);
  assert.equal((await readFile('dist/CNAME','utf8')).trim(),'still.prayert.cn');
});
