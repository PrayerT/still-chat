import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { render } from '../.render/render.js';
const file = new URL('../dist/index.html', import.meta.url);
const html = (await readFile(file, 'utf8')).replace('<!--app-html-->', render());
await writeFile(file, html);
await writeFile(new URL('../dist/.nojekyll', import.meta.url), '');
