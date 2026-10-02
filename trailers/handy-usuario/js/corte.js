/* HANDY · App de usuario — el corte: una escena corrida a otra velocidad y recortada.
   Registra 'hdr-corte'. Corre SIN CAMBIOS una receta de escenas-a.js … escenas-d.js (las escenas de la primera
   versión, de 90 s) o de este tráiler (escenas-golpes.js, escenas-final.js) a otra velocidad:

     { type: 'hdr-corte', de: 'hd-presupuestos', base: 14, k: 0.5, hasta: 12, congela: 11.6, id, titulo, dur, … }
       de      la receta
       base    lo que dura la receta como está escrita (lo que devuelve: 8, 10, 14…)
       k       cada segundo de la receta dura k segundos. Las recetas están escritas a 120 BPM (un tiempo = 0,5 s) y el
               tráiler va a 96 BPM (un tiempo = 0,625 s, una corchea = 0,3125 s): las de la primera versión van con
               k = 0,625 (cada tiempo suyo cae en una corchea) y las de este tráiler con k = 1,25 (cada tiempo, en un
               tiempo). Así sus golpes, toques y "ding" siguen en el pulso.
       hasta   segundos del original donde se corta (default base). La escena dura hasta × k (= dur).
       congela segundos de la receta desde donde no arranca nada más (ni tweens ni sonidos): el cuadro queda quieto hasta
               el corte. Para no cortar en medio de una salida (presupuestos: congela 11,6, hasta 12).
       empuje  cámara lenta y pareja durante la ventana: 1,03 = de escala 1 a 1,03; [a, b] = de a a b. Entre escenas
               seguidas que muestran lo mismo (el teléfono quieto en su lugar), la siguiente arranca donde terminó la
               anterior (confirmación [1, 1,02] → seguimiento [1,02, 1,045] → …): así el corte no salta.
       golpe   la escena entra con un "punch" de escala (inicio del empuje + golpe) → inicio del empuje (expo.out, 0,4 s).
       camara  movimientos de cámara por claves, en vez de empuje/golpe: [{ t, escala, foco: [x, y], dur, ease }]
               t en segundos de la película desde el inicio de la escena; foco = el punto del escenario que queda en el
               centro del cuadro ([720, 540] con escala 1 = sin cámara). Arranca en escala 1 y conviene que termine ahí.
       destello  flash al arrancar, para marcar un drop: un número (pico de opacidad, blanco, 0,5 s) o
               { pico, color, dur }.
       queda   true: la escena no se esconde en el corte (la última de la película: su último cuadro queda quieto
               bajo "Ver de nuevo").

   Cómo: la receta recibe una fachada de D (Object.create) cuyo tl lleva cada posición p a T + (p − T)·k y multiplica
   duration, delay, repeatDelay y stagger por k. Lo que arrancaría en el corte o después (o después de `congela`) no se
   agrega: ni tweens, ni sonidos, ni temblores; un show/hide después del corte queda en el corte. Así nada arranca fuera
   de su ventana, y el último cuadro de cada escena es el que tenía la receta en `hasta` (o en `congela`). Los
   sonidos no se estiran (son voces): la cola de uno que arranca antes del corte puede seguir sonando un poco después.
   Las posiciones tienen que ser números (las recetas del original usan tiempos absolutos): una etiqueta o una posición
   relativa ('<', '+=0,2') corta el armado con un error, en vez de quedar sin acelerar.
   Solo transform y opacity, como el original: la fachada no agrega propiedades; la cámara es x, y y scale de la sección. */
(() => {
  'use strict';

  /** fachada de D: tiempos × k desde T; no arranca nada desde `fin` ni desde `quieto` */
  function acelerar(D, T, k, fin, quieto) {
    const num = p => {
      if (typeof p !== 'number' || !Number.isFinite(p)) throw new Error(`hdr-corte: posición "${p}" (solo tiempos absolutos)`);
      return p;
    };
    const at = p => T + (num(p) - T) * k;
    const vale = (p, v) => {
      const p0 = at(p) + ((v && typeof v.delay === 'number' ? v.delay : 0) * k);
      return p0 < fin - 1e-6 && p0 < quieto - 1e-6;
    };
    const sv = v => {
      if (!v || typeof v !== 'object' || Array.isArray(v)) return v;
      const o = { ...v };
      ['duration', 'delay', 'repeatDelay'].forEach(f => { if (typeof o[f] === 'number') o[f] *= k; });
      if (typeof o.stagger === 'number') o.stagger *= k;
      else if (o.stagger && typeof o.stagger === 'object') {
        o.stagger = { ...o.stagger };
        ['each', 'amount'].forEach(f => { if (typeof o.stagger[f] === 'number') o.stagger[f] *= k; });
      }
      if (Array.isArray(o.keyframes)) o.keyframes = o.keyframes.map(sv);
      return o;
    };
    const tl = D.tl, secciones = [];
    const W = Object.create(D);
    W.tl = {
      to: (t, v, p) => (vale(p, v) ? tl.to(t, sv(v), at(p)) : tl),
      set: (t, v, p) => (vale(p) ? tl.set(t, v, at(p)) : tl),
      fromTo: (t, a, b, p) => (vale(p, b) ? tl.fromTo(t, a, sv(b), at(p)) : tl),
      call: (f, a, p) => (vale(p) ? tl.call(f, a, at(p)) : tl),
      duration: () => tl.duration(),
      time: (...a) => tl.time(...a),
    };
    W.scene = (name, html) => { const s = D.scene(name, html); secciones.push(s); return s; };
    W.sfx = (name, p, ...a) => { if (vale(p)) D.sfx(name, at(p), ...a); };
    W.call = (f, p) => { if (vale(p)) D.call(f, at(p)); };
    W.show = (el, p) => D.show(el, Math.min(at(p), fin));
    W.hide = (el, p) => D.hide(el, Math.min(at(p), fin));
    W.hit = (el, a, b, p) => { if (vale(p, b)) D.hit(el, a, sv(b), at(p)); };
    W.shake = (p, dur = 0.5, amp, grow) => { if (vale(p)) D.shake(at(p), dur * k, amp, grow); };
    W.flash = (p, peak, dur = 0.6, c) => { if (vale(p)) D.flash(at(p), peak, dur * k, c); };
    return { W, secciones };
  }

  /** la cámara de una sección: claves { t, escala, foco: [x, y], dur, ease } desde T (origen de la transformación 0 0) */
  function camara(D, s, T, claves) {
    const pose = (escala = 1, foco = [D.CX, D.CY]) => ({ scale: escala, x: D.CX - escala * foco[0], y: D.CY - escala * foco[1] });
    gsap.set(s, { transformOrigin: '0 0' });
    D.tl.set(s, pose(), T);
    claves.forEach(c => D.tl.to(s, { ...pose(c.escala, c.foco), duration: c.dur ?? 0.3, ease: c.ease || 'power3.inOut' }, T + c.t));
  }

  Trailer.recipe('hdr-corte', (D, T, o) => {
    const receta = Trailer.recipes[o.de];
    if (!receta) throw new Error(`hdr-corte: no existe la receta "${o.de}"`);
    if (o.camara && (o.empuje || o.golpe)) throw new Error(`hdr-corte: ${o.de} con camara y empuje/golpe (son la misma transformación)`);
    const k = o.k ?? 0.5, hasta = o.hasta ?? o.base, dur = +(hasta * k).toFixed(6), fin = T + dur;
    const quieto = o.congela != null ? T + o.congela * k : Infinity;
    const { W, secciones } = acelerar(D, T, k, fin, quieto);
    const devuelve = receta(W, T, { ...o, type: o.de, dur: o.base });
    if (Math.abs(devuelve - o.base) > 0.001) throw new Error(`hdr-corte: ${o.de} dura ${devuelve} s y base dice ${o.base} s`);

    const [e0, e1] = o.empuje == null ? [1, 1] : Array.isArray(o.empuje) ? o.empuje : [1, o.empuje];
    secciones.forEach(s => {
      // una escena que en el original arrancaba la película se ve desde el armado (gsap.set): acá espera su turno
      if (T > 0) gsap.set(s, { autoAlpha: 0 });
      if (!o.queda) D.hide(s, fin);
      if (o.camara) { camara(D, s, T, o.camara); return; }
      if (!o.golpe && e0 === 1 && e1 === 1) return;
      D.tl.set(s, { scale: e0 + (o.golpe || 0) }, T);
      if (o.golpe) D.tl.to(s, { scale: e0, duration: 0.4, ease: 'expo.out' }, T);
      const desde = o.golpe ? T + 0.4 : T;
      if (e1 !== e0) D.tl.to(s, { scale: e1, duration: fin - desde, ease: 'none' }, desde);
    });
    if (o.destello) {
      const d = typeof o.destello === 'number' ? { pico: o.destello } : o.destello;
      D.flash(T, d.pico ?? 1, d.dur ?? 0.5, d.color);
    }
    return dur;
  });
})();
