#!/usr/bin/env node
/* ============================================================================
   capture.mjs — the real data behind EXPORT. Every number on screen comes from here.
     node capture.mjs kinetic   KINETIC → exports/kinetic.mp4 (+ .wav), 16:9, with sound
     node capture.mjs wrapped   WRAPPED → exports/wrapped.mp4, 9:16, with sound
     node capture.mjs beat      BEAT    → exports/beat.gif, 480 px, 15 fps
     node capture.mjs hash      one KINETIC frame (12.4 s) reached three ways → SHA-256 of each PNG
     node capture.mjs build     → ../js/data/export-data.js (window.EXPORT_DATA)
   Each export runs ~/.claude/trailer-kit/tools/export.mjs and keeps its report (exports/<id>.json)
   and its console output (exports/<id>.log, shown in the terminal scene).
   ========================================================================== */
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const HUB = path.resolve(here, '../../..'), OUT = path.join(HUB, 'exports');
const KIT = path.join(os.homedir(), '.claude/trailer-kit/tools/export.mjs');
const JOBS = {
  kinetic: ['trailers/kinetic/index.html', '--wav'],
  wrapped: ['trailers/wrapped/index.html'],
  beat: ['trailers/beat/index.html', '--format', 'gif'],
};
const step = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

if (JOBS[step]) {
  const [html, ...rest] = JOBS[step], ext = rest.includes('gif') ? 'gif' : 'mp4';
  const args = [KIT, html, ...rest, '--out', `exports/${step}.${ext}`, '--report', `exports/${step}.json`];
  console.log('$ node tools/export.mjs ' + [html, ...rest].join(' '));
  const p = spawn(process.execPath, args, { cwd: HUB });
  let log = '';
  p.stdout.on('data', d => { log += d; process.stdout.write(d); });
  p.stderr.on('data', d => { log += d; process.stderr.write(d); });
  const code = await new Promise(r => p.on('close', r));
  fs.writeFileSync(path.join(OUT, step + '.log'), log);
  process.exit(code);
}

if (step === 'hash') {
  const port = 9391, prof = fs.mkdtempSync(path.join(os.tmpdir(), 'xphash-'));
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${port}`, '--hide-scrollbars', '--mute-audio', '--enable-unsafe-swiftshader', `--user-data-dir=${prof}`, '--window-size=1920,1080', 'about:blank'], { stdio: 'ignore' });
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let ws;
  for (let i = 0; i < 40 && !ws; i++) { try { const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); const pg = list.find(t => t.type === 'page'); if (pg) ws = new WebSocket(pg.webSocketDebuggerUrl); } catch { /* */ } if (!ws) await sleep(250); }
  await new Promise(r => ws.addEventListener('open', r));
  let id = 0; const pend = new Map();
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
  const send = (method, params = {}) => new Promise(r => { const k = ++id; pend.set(k, r); ws.send(JSON.stringify({ id: k, method, params })); });
  const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); return r.result && r.result.result ? r.result.result.value : undefined; };
  // node capture.mjs hash <trailer> <t1,t2,…>: the first time is the one shown on screen
  const who = process.argv[3] || 'wrapped', times = String(process.argv[4] || '11.8,2.5,21.3,38.4').split(',').map(Number);
  await send('Page.navigate', { url: pathToFileURL(path.join(HUB, 'trailers', who, 'index.html')).href + '?t=0.01' });
  for (let i = 0; i < 120; i++) { if ((await ev("(document.documentElement && document.documentElement.dataset.trailer) || ''")) === 'ready') break; await sleep(250); }
  const [W, H] = String(await ev("document.documentElement.dataset.stage || '1920x1080'")).split('x').map(Number);
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await ev('gsap.ticker.sleep(), true');
  const dur = await ev('trailer.tl.duration()');
  const go = t => `(() => { const { tl } = trailer; tl.pause(); tl.time(${t}); gsap.ticker.tick(); document.getAnimations().forEach(a => { a.pause(); a.currentTime = tl.time() * 1000; }); return true; })()`;
  const shoot = async () => (await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale: 1 } })).result.data;
  const tests = [];
  for (const T of times) {
    const back = +(T - 2.5).toFixed(1), paths = [['desde 0', 0], ['desde el final', dur - 0.01], ['desde ' + String(back).replace('.', ',') + ' s', back]], out = [];
    await ev(go(T)); await shoot(); // warm-up: the first capture of a moment pays for first paints; not part of the test
    for (const [label, start] of paths) {
      await ev(go(start));
      await ev(go(T));
      const b64 = await shoot(), buf = Buffer.from(b64, 'base64');
      out.push({ label, from: +start.toFixed(2), sha256: crypto.createHash('sha256').update(buf).digest('hex'), b64 });
    }
    // pixel comparison against the first path (decoded in the page): how many pixels differ, by how much
    for (const o of out.slice(1)) {
      o.diff = await ev(`(async () => {
        const px = async b => { const im = await createImageBitmap(await (await fetch('data:image/png;base64,' + b)).blob()); const c = new OffscreenCanvas(im.width, im.height), x = c.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, im.width, im.height).data; };
        const a = await px('${out[0].b64}'), b = await px('${o.b64}');
        let n = 0, max = 0;
        for (let i = 0; i < a.length; i += 4) { const d = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])); if (d) { n++; if (d > max) max = d; } }
        return { pixels: n, of: a.length / 4, maxLevel: max };
      })()`);
    }
    out.forEach(o => delete o.b64);
    const same = new Set(out.map(o => o.sha256)).size === 1;
    tests.push({ t: T, identical: same, paths: out });
    console.log(`${who} ${T}s`.padEnd(16), same ? 'IDENTICAL' : 'DIFFERENT', out.map(o => o.sha256.slice(0, 12) + (o.diff ? ` (${o.diff.pixels} px, ≤${o.diff.maxLevel})` : '')).join(' · '));
  }
  const version = (await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()).Browser;
  fs.writeFileSync(path.join(OUT, 'hash.json'), JSON.stringify({ trailer: who, stage: `${W}x${H}`, tests, browser: version }, null, 1));
  ws.close(); chrome.kill();
  setTimeout(() => fs.rm(prof, { recursive: true, force: true }, () => process.exit(0)), 500);
}

if (step === 'build') {
  const rd = f => JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8'));
  const slim = r => { const x = { ...r }; delete x.file; if (x.wav) x.wav = { bytes: x.wav.bytes }; if (x.audio) { x.audio = { ...x.audio }; delete x.audio.peaks; delete x.audio.eventTimes; } return x; };
  const kin = rd('kinetic.json');
  // the console output of the KINETIC export, as the terminal showed it (progress lines collapsed)
  const log = fs.readFileSync(path.join(OUT, 'kinetic.log'), 'utf8').split('\n').map(l => l.split('\r').filter(Boolean).pop() || '').filter(l => l.trim())
    .map(l => l.replace(/[A-Z]:[\\/].*?[\\/](exports[\\/]\S+)/g, (m, f) => f.replace(/\\/g, '/')));
  const data = {
    measured: new Date().toISOString().slice(0, 10),
    runs: { kinetic: slim(kin), wrapped: slim(rd('wrapped.json')), beat: slim(rd('beat.json')) },
    waveform: { peaks: kin.audio.peaks, events: kin.audio.eventTimes, duration: kin.duration },
    cmd: 'node ~/.claude/trailer-kit/tools/export.mjs ' + [...JOBS.kinetic, '--out', 'exports/kinetic.mp4', '--report', 'exports/kinetic.json'].join(' '),
    log,
    hash: rd('hash.json'),
  };
  // the hub's own posters (hub/motifs.js) for the three exported trailers
  globalThis.window = globalThis.window || {};
  await import(pathToFileURL(path.join(HUB, 'hub/catalog.js')).href);
  await import(pathToFileURL(path.join(HUB, 'hub/motifs.js')).href);
  const { MOTIFS, textOn } = window.HUB_ART;
  data.posters = Object.fromEntries(Object.keys(JOBS).map(id => {
    const it = window.HUB_CATALOG.find(x => x.id === id), [p0, a, b] = it.palette, fg = textOn(p0);
    return [id, { title: it.title, palette: it.palette, fg, svg: (MOTIFS[it.motif] || MOTIFS.shapes)({ a, b, fg }) }];
  }));
  const dest = path.join(here, '../js/data/export-data.js');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, `/* EXPORT data — real exports made by tools/capture.mjs with ~/.claude/trailer-kit/tools/export.mjs. */\nwindow.EXPORT_DATA = ${JSON.stringify(data)};\n`);
  console.log('→ ' + dest);
  console.log(log.join('\n'));
}
