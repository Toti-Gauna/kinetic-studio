#!/usr/bin/env node
/* ============================================================================
   measure.mjs — the data behind WRAPPED. Loads every published trailer of the hub
   in headless Chrome (DevTools protocol) and measures, for real:
     duration, stage, scenes (labels, types, lengths), animations (tweens with a
     duration), events (zero-length calls: sounds, cues), words on screen (HTML text),
     distinct recipes; plus title, category and palette from hub/catalog.js.
   Writes ../js/data/wrapped-data.js  →  window.WRAPPED_DATA = { measured, trailers: [...] }
   node trailers/wrapped/tools/measure.mjs
   ========================================================================== */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const HUB = path.resolve(here, '../../..');
globalThis.window = {};
await import(pathToFileURL(path.join(HUB, 'hub/catalog.js')).href);
const catalog = window.HUB_CATALOG.filter(x => x.enabled && x.id !== 'wrapped');

const CH = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find(p => fs.existsSync(p));
const port = 9500 + Math.floor(Math.random() * 300), prof = fs.mkdtempSync(path.join(os.tmpdir(), 'wrapped-'));
const chrome = spawn(CH, ['--headless=new', `--remote-debugging-port=${port}`, '--mute-audio', '--enable-unsafe-swiftshader', `--user-data-dir=${prof}`, '--window-size=1920,1080', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws;
for (let i = 0; i < 60 && !ws; i++) { try { const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); const pg = list.find(t => t.type === 'page'); if (pg) ws = new WebSocket(pg.webSocketDebuggerUrl); } catch { /* not up */ } if (!ws) await sleep(250); }
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pend = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise(r => { const k = ++id; pend.set(k, r); ws.send(JSON.stringify({ id: k, method, params })); });
const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); return r.result && r.result.result ? r.result.result.value : undefined; };

const out = [];
for (const it of catalog) {
  const url = pathToFileURL(path.join(HUB, it.path)).href + '?t=0.01&now=2026-09-29T12:00:00';
  await send('Page.navigate', { url });
  let st = '';
  for (let i = 0; i < 120; i++) { st = await ev("document.documentElement.dataset.trailer || ''"); if (st) break; await sleep(250); }
  if (st !== 'ready') { console.log(it.id.padEnd(16), 'NOT READY', st); continue; }
  const m = await ev(`(() => {
    const { tl } = window.trailer, kids = tl.getChildren(true, true, false);
    const anim = kids.filter(c => c.duration() > 0).length, events = kids.filter(c => c.duration() === 0 && c.vars && c.vars.onComplete).length;
    const text = [...document.querySelectorAll('#camera .scene')].map(s => s.textContent).join(' ');
    const words = (text.match(/\\p{L}[\\p{L}'’-]*/gu) || []).length;
    const map = JSON.parse(document.documentElement.dataset.scenes || '[]');
    return { duration: +tl.duration().toFixed(2), stage: document.documentElement.dataset.stage || '1920x1080', animations: anim, events, words, scenes: map, recipes: [...new Set(map.map(s => s.type))].length };
  })()`);
  out.push({ id: it.id, title: it.title, category: it.category, palette: it.palette, ...m });
  console.log(it.id.padEnd(16), String(m.duration).padStart(6), 's', String(m.scenes.length).padStart(3), 'escenas', String(m.animations).padStart(6), 'anim', String(m.events).padStart(5), 'eventos', String(m.words).padStart(5), 'palabras');
}
ws.close(); chrome.kill();
setTimeout(() => fs.rm(prof, { recursive: true, force: true }, () => {}), 500);
const data = { measured: '2026-09-29', trailers: out };
const dest = path.join(here, '../js/data/wrapped-data.js');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, `/* WRAPPED data — measured by tools/measure.mjs from every published trailer of the hub (real numbers). */\nwindow.WRAPPED_DATA = ${JSON.stringify(data)};\n`);
console.log(`\n${out.length} trailers → ${dest}`);
