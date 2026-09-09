import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { render } from '../.render/render.js';
const file = new URL('../dist/index.html', import.meta.url);
const template = await readFile(file, 'utf8');
await writeFile(file, template.replace('<!--app-html-->', render('zh')));
const enTemplate = template
  .replace('lang="zh-CN"', 'lang="en"')
  .replaceAll('STILL · 慢一点，听你说', 'STILL · A little room to be heard')
  .replace('一份可操作的聊天界面样例。两种阅读氛围、角色切换与值得收藏的片段。', 'An interactive chat interface demo. Two atmospheres, familiar voices, and words worth keeping.')
  .replace('留白与入境，两种可以亲自体验的聊天氛围。', 'Try Daylight and Afterglow. A little space for a slower conversation.')
  .replaceAll('https://still.prayert.cn/og.jpg', 'https://still.prayert.cn/og-en.jpg')
  .replaceAll('content="https://still.prayert.cn/"', 'content="https://still.prayert.cn/en/"')
  .replace('rel="canonical" href="https://still.prayert.cn/"', 'rel="canonical" href="https://still.prayert.cn/en/"')
  .replace('content="zh_CN"', 'content="en_US"');
await mkdir(new URL('../dist/en/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/en/index.html', import.meta.url), enTemplate.replace('<!--app-html-->', render('en')));
await writeFile(new URL('../dist/.nojekyll', import.meta.url), '');
