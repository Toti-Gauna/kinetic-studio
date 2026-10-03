/* Handy — reproductor compartido por los tráileres de Handy (app de usuario y app del especialista).
   Es un plugin del Trailer Kit: el main.ts del tráiler lo importa después de engine.js (y de
   recipes-music.js) y antes de las escenas; al importarse se registra con window.Trailer.plugin().

   Qué hace
   - Etiquetas: D.tl.addLabel(id, T) al inicio de cada escena que tiene `id`. Si la escena declara `dur`
     y la receta devuelve otra duración (más de 0,001 s de diferencia), corta el build con un error claro:
     ninguna escena se corre de su ventana del storyboard. Un id repetido también corta el build.
   - Capítulos (las escenas con id, numeradas desde 1): window.trailer.capitulos,
     window.trailer.saltar(id | número) y window.trailer.capituloActual(). Un salto = SFX.stopAll(0,05) +
     tl.seek(etiqueta) exacto y sigue reproduciendo (si estaba en pausa, la reanuda). El seek no dispara lo
     que queda en el camino, y GSAP 3.13 dispara una vez los callbacks que están justo en la etiqueta
     cuando el cabezal arranca desde ahí: los golpes del corte (D.sfx en T, los 'hit' de la música) suenan.
   - Tocar la película (#viewport) pausa y reanuda, despachando la tecla Espacio del engine (así corre su
     propia lógica: suspende/reanuda el audio y escribe el estado). En pausa aparece #hd-pausa, una
     tarjeta abajo (el cuadro queda a la vista para comentarlo): el ícono, "En pausa · Tocá para seguir"
     y una ficha por capítulo ("1 Gancho", "2 Problema"…) con el actual resaltado; tocar una ficha salta
     ahí y sigue; tocar en cualquier otro lado reanuda.
   - Teclado (además de los del engine: Espacio pausa · M silencio · R de nuevo · F pantalla completa ·
     Esc vuelve al hub): → y AvPág escena siguiente · ← y RePág escena anterior (si van más de 2 s de la
     actual, vuelve a su inicio; un segundo toque va a la anterior) · 1–9 y 0 escenas 1–10 · B y . pausa
     (el botón "pantalla negra" de los presentadores). En la pantalla inicial, → / AvPág arrancan y un
     número arranca en esa escena.
   - URL: ?escena=<id|número> arranca en esa escena después del toque inicial · ?qr=<url> pisa cfg.qrUrl
     (solo en desarrollo, para probar el QR) · ?audit recorre cada tween de D.tl y escribe
     document.documentElement.dataset.audit = { ok, tweens, violations, engine } (ver auditar()).
   - iPad: suena aunque esté en modo silencio (navigator.audioSession = 'playback', Safari 17+) y la
     pantalla no se apaga mientras se ve o se comenta en pausa (Screen Wake Lock, se pide en cada toque).
   - Pantalla inicial: pone handyLogo() en #hd-intro-logo.
   - Estado en <html data-hd-estado="intro|reproduciendo|pausa|fin"> para css/player.css y los tests.
   - Sangrado: en pantallas que no son 4:3 la película se ve hasta el borde de la pantalla, no solo en el cuadro de
     1440×1080 (armarSangrado(); el cuánto, en sangrado() de layout.ts y en <html data-hd-sangrado="XxY">).
   Con ?embed (vista previa del hub) o ?t= (cuadro congelado) solo quedan las etiquetas, los capítulos,
   ?audit y saltar(), que ahí mueve el cabezal sin reproducir: nada de toques, teclas, pausa ni sonido. */
import { gsap } from 'gsap';
import { handyLogo } from './logo.ts';
import { sangrado } from './layout.ts';
import './css/base.css';
import './css/player.css';

export type Capitulo = HandyCapitulo;

/** Resultado de ?audit (document.documentElement.dataset.audit, en JSON). */
export interface Auditoria {
  /** true si ningún tween que dura más de 0 s anima algo que no sea transform u opacity */
  ok: boolean;
  /** tweens con duración revisados (película + engine) */
  tweens: number;
  /** tweens de la película (escenas) con propiedades prohibidas: solo esas propiedades */
  violations: { t: number; target: string; props: string[] }[];
  /** tweens del engine (HUD, barras, fondo, cortina, flash, cámara): todas sus propiedades y las prohibidas */
  engine: { t: number; target: string; props: string[]; forbidden: string[] }[];
}

const q = new URLSearchParams(location.search);
const EMBED = q.has('embed');
/** el engine congela el cuadro con ?t= y en la vista previa del hub (?embed): sin intro ni controles */
const CONGELADO = EMBED || q.has('t');
/** ← dentro de los primeros 2 s de una escena va a la anterior; después, vuelve al inicio de la actual */
const REINICIO = 2;
/** tolerancia para saber en qué capítulo está el cabezal */
const MARGEN = 0.005;

const capitulos: Capitulo[] = [];
const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: unknown) => String(s).replace(/[&<>"]/g, c => ESCAPES[c] ?? c);
const r3 = (n: number) => Math.round(n * 1000) / 1000;
const seg = (n: number) => String(r3(n)).replace('.', ',');
const root = document.documentElement;

root.classList.add('hd-player');
if (!CONGELADO) root.dataset.hdEstado = 'intro';
const logo = document.getElementById('hd-intro-logo');
if (logo) logo.innerHTML = handyLogo();

// iPad: el sonido de la película es "reproducción", no "ambiente": suena aunque el iPad esté en silencio
if (!CONGELADO) {
  const nav = navigator as Navigator & { audioSession?: { type: string } };
  try { if (nav.audioSession) nav.audioSession.type = 'playback'; } catch { /* Safari < 17 o sin soporte */ }
}

/** El sangrado (src/handy/layout.ts): el escenario deja de recortar en su cuadro de 1440×1080 y se ve hasta el borde
    de la pantalla. Las capas del escenario (#bg, #wipe, #camera, #flash…) pasan a #hd-cuadro (mismo lugar y tamaño que
    el cuadro: las coordenadas no cambian) dentro de #hd-marco, que recorta en el sangrado medido (más allá, el gris de
    la página). css/player.css lee --hd-sx / --hd-sy (px del escenario) y estira #bg y #flash hasta ahí. */
function armarSangrado() {
  const stage = document.getElementById('stage');
  if (!stage || document.getElementById('hd-marco')) return;
  const { x, y } = sangrado();
  root.style.setProperty('--hd-sx', `${x}px`);
  root.style.setProperty('--hd-sy', `${y}px`);
  root.dataset.hdSangrado = `${x}x${y}`;
  const marco = document.createElement('div');
  marco.id = 'hd-marco';
  const cuadro = document.createElement('div');
  cuadro.id = 'hd-cuadro';
  cuadro.append(...Array.from(stage.childNodes));
  marco.appendChild(cuadro);
  stage.appendChild(marco);
}

/** Un capítulo por id ('presupuestos') o por número desde 1 (6, o '6' como en ?escena=6). */
function buscar(x: string | number): Capitulo | null {
  if (typeof x === 'number') return capitulos[x - 1] ?? null;
  const s = x.trim();
  return capitulos.find(c => c.id === s) ?? (/^\d+$/.test(s) ? capitulos[Number(s) - 1] ?? null : null);
}
function indiceEn(t: number): number {
  let i = 0;
  capitulos.forEach((c, k) => { if (c.start <= t + MARGEN) i = k; });
  return i;
}

window.Trailer.plugin({
  setup(_D, cfg) {
    capitulos.length = 0;
    armarSangrado(); // acá el engine ya anotó el tamaño del escenario (data-stage): sirve también para el vertical
    if (import.meta.env.DEV) {
      const qr = q.get('qr');
      if (qr !== null) cfg.qrUrl = qr;
    }
  },

  scene(D, T, s, dur) {
    if (typeof s.dur === 'number' && Math.abs(dur - s.dur) > 0.001) {
      throw new Error(`Escena "${s.id ?? s.type}": la receta ${s.type} dura ${seg(dur)} s y el storyboard le da ${seg(s.dur)} s (${seg(T)}–${seg(T + s.dur)} s)`);
    }
    if (!s.id) return;
    if (capitulos.some(c => c.id === s.id)) throw new Error(`Escena repetida: "${s.id}" (cada id es una etiqueta GSAP única)`);
    D.tl.addLabel(s.id, T);
    capitulos.push({ n: capitulos.length + 1, id: s.id, titulo: s.titulo ?? s.id, start: r3(T), dur: r3(dur) });
  },

  done(D, cfg) {
    if (q.has('audit')) auditar(D.tl);
    publicar(D.tl);
    if (!CONGELADO) reproductor(D.tl, cfg);
  },
});

// ---------------------------------------------------------------- window.trailer
let iniciar: ((c: Capitulo) => void) | null = null; // reproductor(): salta (o deja programado el arranque)

function publicar(tl: GSAPTimeline) {
  const lista: readonly Capitulo[] = Object.freeze(capitulos.map(c => Object.freeze({ ...c })));
  const api = {
    capitulos: lista,
    saltar(x: string | number): Capitulo | null {
      const c = buscar(x);
      if (!c) return null;
      if (iniciar) iniciar(c);
      else tl.seek(c.start); // ?t= / ?embed: solo mueve el cabezal
      return c;
    },
    capituloActual: (): Capitulo | null => capitulos[indiceEn(tl.time())] ?? null,
  };
  // el engine asigna window.trailer DESPUÉS de los done de los plugins (en el mismo build síncrono)
  const pegar = () => {
    const t = window.trailer;
    if (t && !t.saltar) Object.assign(t, api);
    return !!t;
  };
  queueMicrotask(() => {
    if (pegar()) return;
    let intentos = 0;
    const cada = () => { if (pegar() || ++intentos > 600) gsap.ticker.remove(cada); };
    gsap.ticker.add(cada);
  });
}

// ---------------------------------------------------------------- reproductor
function reproductor(tl: GSAPTimeline, cfg: KitConfig) {
  const play = document.getElementById('play') as HTMLButtonElement | null;
  const viewport = document.getElementById('viewport');
  const fin = document.getElementById('end');
  let arrancado = false; // el engine ya llamó a tl.play(0) (después del toque inicial)
  let estado = 'intro';
  let pendiente: Capitulo | null = null; // capítulo de arranque (?escena, o un número en la pantalla inicial)

  // el toque inicial arranca con tl.play(0): una sola vez, si hay un capítulo pendiente, arranca ahí
  tl.play = ((from?: gsap.Position | null, suppressEvents?: boolean) => {
    Reflect.deleteProperty(tl, 'play'); // vuelve el play de GSAP
    const p = pendiente;
    pendiente = null;
    return tl.play(p ? p.start : from, suppressEvents);
  }) as typeof tl.play;

  const escena = q.get('escena');
  if (escena) {
    pendiente = buscar(escena);
    if (!pendiente) console.warn(`?escena=${escena}: no existe (capítulos: ${capitulos.map(c => c.id).join(', ')})`);
  }

  // el engine deshabilita el botón al arrancar: .hd-tocado mantiene la píldora azul mientras el intro se va
  if (play) {
    let listo = false;
    new MutationObserver(() => {
      if (!play.disabled) listo = true;
      else if (listo) play.classList.add('hd-tocado');
    }).observe(play, { attributes: true, attributeFilter: ['disabled'] });
  }

  // la pantalla no se apaga mientras se ve la película o se comenta en pausa (el cierre tiene un QR)
  let luz: WakeLockSentinel | null = null, pidiendo = false;
  const despierta = () => {
    if (luz || pidiendo || document.visibilityState !== 'visible' || !('wakeLock' in navigator)) return;
    pidiendo = true;
    navigator.wakeLock.request('screen').then(l => {
      luz = l;
      l.addEventListener('release', () => { luz = null; });
    }, () => {}).finally(() => { pidiendo = false; });
  };
  addEventListener('click', despierta, true);
  addEventListener('keydown', despierta, true);

  // la tecla Espacio del engine: pausa / reanuda con su lógica (audio, texto de estado)
  const espacio = () => { window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' })); };
  const arrancar = () => { if (play && !play.disabled) play.click(); };

  const ir = (c: Capitulo) => {
    if (!arrancado) { pendiente = c; arrancar(); return; }
    window.SFX.stopAll(0.05);
    if (tl.progress() >= 1 && fin) { gsap.killTweensOf(fin); gsap.to(fin, { autoAlpha: 0, duration: 0.3 }); }
    tl.seek(c.start); // (si la película ya había terminado, el seek la vuelve a poner en marcha)
    if (tl.paused()) espacio();
  };
  iniciar = ir;

  // la pantalla de pausa, fuera del escenario
  const pausa = document.createElement('div');
  pausa.id = 'hd-pausa';
  pausa.className = 'hd-pausa hd-ui';
  pausa.setAttribute('role', 'dialog');
  pausa.setAttribute('aria-label', cfg.ui.paused ?? 'En pausa');
  pausa.innerHTML = `<div class="hd-pausa-panel">
      <div class="hd-pausa-estado">
        <span class="hd-pausa-icono" aria-hidden="true"><i></i><i></i></span>
        <p class="hd-pausa-texto"><b>${esc(cfg.ui.paused ?? 'En pausa')}</b><span class="hd-pausa-sep"> · </span><span>Tocá para seguir</span></p>
      </div>
      <div class="hd-pausa-capitulos" role="group" aria-label="Escenas">${capitulos.map(c =>
        `<button type="button" class="hd-capitulo" data-id="${esc(c.id)}" data-n="${c.n}"><span class="hd-capitulo-n">${c.n}</span> <span class="hd-capitulo-titulo">${esc(c.titulo)}</span></button>`).join('')}</div>
    </div>`;
  document.body.appendChild(pausa);
  const fichas = Array.from(pausa.querySelectorAll<HTMLButtonElement>('.hd-capitulo'));
  pausa.addEventListener('click', ev => {
    const ficha = (ev.target as Element).closest<HTMLButtonElement>('.hd-capitulo');
    if (ficha) {
      ficha.blur();
      const c = buscar(ficha.dataset.id ?? '');
      if (c) ir(c);
    } else if (estado === 'pausa') espacio();
  });

  // tocar la película: pausa / reanuda
  viewport?.addEventListener('click', () => {
    if (arrancado && tl.progress() < 1) espacio();
  });

  addEventListener('keydown', ev => {
    if (ev.metaKey || ev.ctrlKey || ev.altKey || !capitulos.length) return;
    const k = ev.key;
    const siguiente = k === 'ArrowRight' || k === 'PageDown';
    const anterior = k === 'ArrowLeft' || k === 'PageUp';
    const numero = /^[0-9]$/.test(k) ? buscar(k === '0' ? 10 : Number(k)) : null;
    if (!siguiente && !anterior && !numero && k !== 'b' && k !== 'B' && k !== '.') return;
    ev.preventDefault();
    if (ev.repeat) return;
    if (!arrancado) { // pantalla inicial: → / AvPág arrancan, un número arranca en esa escena
      if (numero) ir(numero);
      else if (siguiente) arrancar();
      return;
    }
    const i = indiceEn(tl.time());
    if (siguiente) { const c = capitulos[i + 1]; if (c) ir(c); }
    else if (anterior) {
      const actual = capitulos[i];
      if (actual) ir(i > 0 && tl.time() - actual.start < REINICIO ? capitulos[i - 1]! : actual);
    } else if (numero) ir(numero);
    else if (tl.progress() < 1) espacio(); // B / . (pantalla negra de los presentadores)
  });

  // en iPad, un pellizco no agranda la página en medio de la película
  document.addEventListener('gesturestart', e => e.preventDefault());

  // estado: intro → reproduciendo ⇄ pausa → fin
  gsap.ticker.add(() => {
    if (!arrancado) {
      if (tl.paused()) return;
      arrancado = true;
    }
    const e = tl.progress() >= 1 ? 'fin' : tl.paused() ? 'pausa' : 'reproduciendo';
    if (e === estado) return;
    estado = e;
    root.dataset.hdEstado = e;
    if (e === 'pausa') {
      const actual = capitulos[indiceEn(tl.time())];
      fichas.forEach(f => {
        const si = f.dataset.id === actual?.id;
        f.classList.toggle('is-actual', si);
        if (si) f.setAttribute('aria-current', 'step');
        else f.removeAttribute('aria-current');
      });
    }
  });
}

// ---------------------------------------------------------------- ?audit
/** Las únicas propiedades que una película de Handy puede animar (transform y opacity). */
const PERMITIDAS = new Set(['x', 'y', 'xPercent', 'yPercent', 'z', 'scale', 'scaleX', 'scaleY', 'rotation', 'rotate',
  'rotationZ', 'opacity', 'autoAlpha', 'transformOrigin', 'svgOrigin', 'force3D', 'smoothOrigin']);
/** Claves de control de GSAP (no son propiedades animadas); también las on* y las internas (parent). */
const CONTROL = new Set(['ease', 'duration', 'delay', 'repeat', 'repeatDelay', 'yoyo', 'stagger', 'keyframes',
  'immediateRender', 'overwrite', 'callbackScope', 'onComplete', 'onStart', 'onUpdate', 'onRepeat', 'id', 'data',
  'runBackwards', 'startAt', 'inherit', 'paused', 'lazy', 'parent', 'yoyoEase', 'repeatRefresh', 'reversed',
  'easeEach', 'defaults']);
/** Capas del engine: lo que se anima acá lo agrega el kit (HUD, barras, fondo, cortina, flash, cámara). */
const MOTOR = '#hud, #hud *, .bar, #bg, #wipe, #flash, #camera, #fx, #vignette, #grain, #stage, #viewport';

function animadas(vars: Record<string, unknown>): string[] {
  const out = new Set<string>();
  const sumar = (v: unknown) => {
    if (!v || typeof v !== 'object') return;
    for (const k of Object.keys(v)) {
      if (CONTROL.has(k) || /^on[A-Z]/.test(k) || k.startsWith('_')) continue;
      if (k === 'css') sumar((v as Record<string, unknown>)[k]);
      else out.add(k);
    }
  };
  sumar(vars);
  const kf = vars.keyframes;
  if (Array.isArray(kf)) kf.forEach(sumar);
  else if (kf && typeof kf === 'object') {
    for (const [k, v] of Object.entries(kf)) {
      if (/^\d+(\.\d+)?%$/.test(k)) sumar(v); // { '50%': { x: … } }
      else if (k !== 'ease' && k !== 'easeEach') out.add(k); // { x: [0, 10, 0] }
    }
  }
  return [...out];
}

function describir(targets: unknown[]): string {
  const t = targets[0];
  let s = '—';
  if (t instanceof Element) {
    s = t.id ? `#${t.id}` : t.tagName.toLowerCase() + Array.from(t.classList).slice(0, 2).map(c => '.' + c).join('');
    const id = t.getAttribute('data-id');
    if (id && !t.id) s += `[data-id="${id}"]`;
  } else if (t && typeof t === 'object') s = `{${Object.keys(t).slice(0, 3).join(', ')}}`;
  return targets.length > 1 ? `${s} (+${targets.length - 1})` : s;
}

/** Recorre cada tween de D.tl (timelines anidados y keyframes incluidos) y anota los que duran más de 0 s
    y animan algo que no sea transform u opacity. Los sets instantáneos (duración 0) están permitidos. */
function auditar(tl: GSAPTimeline) {
  const res: Auditoria = { ok: true, tweens: 0, violations: [], engine: [] };
  const recorrer = (padre: GSAPTimeline, desde: number) => {
    for (const hijo of padre.getChildren(false, true, true)) {
      const at = desde + hijo.startTime();
      if (hijo instanceof gsap.core.Timeline) { recorrer(hijo, at); continue; }
      if (!(hijo.duration() > 0)) continue;
      res.tweens++;
      const targets = (hijo as GSAPTween).targets();
      const props = animadas(hijo.vars as Record<string, unknown>);
      const prohibidas = props.filter(p => !PERMITIDAS.has(p));
      const target = describir(targets);
      if (targets.some(x => x instanceof Element && x.matches(MOTOR))) res.engine.push({ t: r3(at), target, props, forbidden: prohibidas });
      else if (prohibidas.length) res.violations.push({ t: r3(at), target, props: prohibidas });
    }
  };
  recorrer(tl, 0);
  res.ok = !res.violations.length && res.engine.every(e => !e.forbidden.length);
  root.dataset.audit = JSON.stringify(res);
  console.info('[audit]', res.ok ? 'ok' : 'con problemas', res);
}
