import {readFile, writeFile} from 'node:fs/promises';
import {Resvg} from '@resvg/resvg-js';

const GREEN = '#2F7D5B';
const SIZE = 1024;
const OUT = 'assets/images/';

const favicon = await readFile('../web/public/favicon.svg', 'utf8');
const logo = favicon.match(/<rect[^>]*\/>(.*)<\/svg>/s)?.[1];
if (!logo) throw new Error('Logoul nu a fost găsit în favicon.svg.');

const source = await readFile('../web/features/profi/profi.tsx', 'utf8');
const start = source.indexOf('<g className="dol-swim">');
const end = source.indexOf('</svg>', start);
if (start < 0 || end < 0) throw new Error('Desenul lui Profi nu a fost găsit în profi.tsx.');
const profi = source.slice(start, end)
  .replace(/ className="[^"]*"/g, '')
  .replace(/strokeWidth/g, 'stroke-width')
  .replace(/strokeLinecap/g, 'stroke-linecap')
  .replace(/strokeLinejoin/g, 'stroke-linejoin');

function centered(scale, content = logo) {
  return `<g transform="translate(${SIZE / 2} ${SIZE / 2}) scale(${scale}) translate(-19 -17)">${content}</g>`;
}

function svg(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">${content}</svg>`;
}

async function png(name, content, width = SIZE) {
  const image = new Resvg(svg(content), {fitTo: {mode: 'width', value: width}, font: {loadSystemFonts: false}}).render();
  await writeFile(OUT + name, image.asPng());
  console.log(`${OUT}${name}: ${image.width}x${image.height}`);
}

await png('icon.png', `<rect width="${SIZE}" height="${SIZE}" fill="${GREEN}"/>${centered(27)}`);
await png('favicon.png', `<rect width="${SIZE}" height="${SIZE}" rx="210" fill="${GREEN}"/>${centered(27)}`, 48);

await png('android-icon-foreground.png', centered(21));

await png('android-icon-monochrome.png', centered(21, logo.replace(/#[0-9A-Fa-f]{6}/g, '#FFFFFF')));

await png('splash-icon.png', `<g transform="translate(${SIZE / 2} ${SIZE / 2}) scale(6.4) translate(-70 -65)">${profi}</g>`);
