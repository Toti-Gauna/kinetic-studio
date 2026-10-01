#!/usr/bin/env node
/* ============================================================================
   adopt-trailer.mjs — moves a trailer built with the Trailer Kit (classic <script> tags + GSAP/Three
   from the CDN) into the Vite build.

     npm run adopt -- trailers/<id> [more dirs...]

   For each folder it reads index.html, replaces the block of <script> tags at the end of <body> with
   a single <script type="module" src="./main.ts">, and writes main.ts with one import per script,
   in the same order:
     · GSAP from the CDN          → src/lib/gsap.ts (+ gsap-interactive.ts for ScrollTrigger/Observer)
     · Three.js r147 from the CDN → src/lib/three.ts (kept commented out if it was commented out)
     · ../../hub/catalog.js       → src/lib/hub-catalog.ts (publishes window.HUB_CATALOG)
     · local js/*.js              → import './js/….js'
   The kit scripts stay as they are: they already work as ES modules (they talk through window).
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIB = path.join(ROOT, 'src/lib');

// whole lines of <script> tags, <!-- comments --> and blank lines
const SCRIPT_BLOCK = /(?<=\n)(?:[ \t]*(?:<script\b[^>]*><\/script>|<!--[\s\S]*?-->)?[ \t]*\r?\n)+/g;
const CDN_GSAP = /cdn\.jsdelivr\.net\/npm\/gsap@[^/]+\/dist\/(gsap|SplitText|MorphSVGPlugin|DrawSVGPlugin|ScrambleTextPlugin)\.min\.js$/;
const CDN_GSAP_INTERACTIVE = /cdn\.jsdelivr\.net\/npm\/gsap@[^/]+\/dist\/(ScrollTrigger|Observer)\.min\.js$/;
const CDN_THREE = /cdn\.jsdelivr\.net\/npm\/three@0\.147\.0\//;

function adopt(dir) {
  const html = path.join(dir, 'index.html'), entry = path.join(dir, 'main.ts');
  const rel = p => {
    const r = path.relative(dir, p).split(path.sep).join('/');
    return r.startsWith('.') ? r : './' + r;
  };
  let src = fs.readFileSync(html, 'utf8');
  if (/<script type="module" src="\.\/main\.ts"><\/script>/.test(src)) return console.log(`${dir}: already adopted`);

  // the last run of <script>/<!-- --> lines before </body> is the loader block
  const blocks = [...src.matchAll(SCRIPT_BLOCK)].filter(m => /<script\b/.test(m[0]));
  const block = blocks.at(-1);
  if (!block || !/^\s*<\/body>/.test(src.slice(block.index + block[0].length))) throw new Error(`${dir}: no <script> block right before </body>`);

  const lines = [];
  const once = new Set();
  const add = (spec, note = '', commented = false) => {
    if (once.has(spec)) return;
    once.add(spec);
    lines.push(`${commented ? '// ' : ''}import '${spec}';${note ? ' // ' + note : ''}`);
  };
  // active scripts and commented-out ones, in document order
  const items = [...block[0].matchAll(/<!--([\s\S]*?)-->|<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)]
    .flatMap(m => m[2] ? [{ src: m[2], commented: false }]
      : [...m[1].matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(s => ({ src: s[1], commented: true })));

  for (const { src: s, commented } of items) {
    if (CDN_GSAP.test(s)) { if (!commented) add(rel(path.join(LIB, 'gsap.ts')), 'GSAP + SplitText, MorphSVG, DrawSVG, ScrambleText on window'); }
    else if (CDN_GSAP_INTERACTIVE.test(s)) { if (!commented) add(rel(path.join(LIB, 'gsap-interactive.ts')), 'ScrollTrigger + Observer (interactive mode)'); }
    else if (CDN_THREE.test(s)) add(rel(path.join(LIB, 'three.ts')), commented ? '3D recipes (js/recipes-3d.js) need Three.js: uncomment to load it' : 'Three.js r147 + postprocessing as window.THREE', commented);
    else if (/^https?:/.test(s)) throw new Error(`${dir}: unknown CDN script ${s} — add a module for it in src/lib`);
    else if (commented) continue;
    else if (path.resolve(dir, s) === path.join(ROOT, 'hub/catalog.js')) add(rel(path.join(LIB, 'hub-catalog.ts')), 'window.HUB_CATALOG');
    else {
      if (!fs.existsSync(path.resolve(dir, s))) throw new Error(`${dir}: ${s} not found`);
      add(s.startsWith('.') ? s : './' + s);
    }
  }

  const title = (src.match(/<title>([^<]*)<\/title>/) || [, path.basename(dir)])[1];
  fs.writeFileSync(entry, `/* ${title}
   Entry point. Order matters: the kit scripts are plain modules that talk through window
   (GSAP → audio → engine → recipes → trailer config), so each one must run after the ones it uses. */
${lines.join('\n')}
`);
  src = src.slice(0, block.index) + '<script type="module" src="./main.ts"></script>\n' + src.slice(block.index + block[0].length);
  fs.writeFileSync(html, src);
  console.log(`${dir}: ${lines.length} imports → main.ts`);
}

const dirs = process.argv.slice(2);
if (!dirs.length) {
  console.error('usage: npm run adopt -- trailers/<id> [more dirs...]');
  process.exit(2);
}
for (const d of dirs) adopt(path.resolve(d));
