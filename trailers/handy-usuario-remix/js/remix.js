/* HANDY USUARIO REMIX — el corte: una escena del tráiler original, acelerada y recortada.
   Registra 'hdr-corte'. Corre una receta de escenas-a.js … escenas-d.js SIN CAMBIOS a otra velocidad:

     { type: 'hdr-corte', de: 'hd-presupuestos', base: 14, k: 0.5, hasta: 12, id, titulo, dur, empuje, golpe }
       de      la receta original
       base    lo que dura en el original (lo que devuelve: 8, 10, 14…)
       k       cada segundo del original dura k segundos. Con 0,5 (el doble de rápido) cada tiempo del original
               (0,5 s a 120 BPM) cae en una corchea (0,25 s): sus golpes, toques y "ding" siguen en el pulso.
       hasta   segundos del original donde se corta (default base). La escena dura hasta × k (= dur).
       empuje  cámara: la escena va de escala 1 a `empuje` durante su ventana (ej. 1,03), lento y parejo.
       golpe   la escena entra con un "punch" de escala 1 + golpe → 1 (expo.out, 0,4 s).
       destello  flash blanco al arrancar (pico de opacidad, 0–1): marca un drop.
       extra   superposiciones de las escenas del remix: [{ tipo: 'sello', at, … }] llama a
               Trailer.remix[tipo](D, T + at, fin, opciones) (at en segundos del remix desde el inicio de la escena).

   Cómo: la receta recibe una fachada de D (Object.create) cuyo tl lleva cada posición p a T + (p − T)·k y multiplica
   duration, delay, repeatDelay y stagger por k. Lo que cae en el corte o después no se agrega: ni tweens, ni sonidos,
   ni temblores; un show/hide después del corte queda en el corte. Así nada se mueve ni suena fuera de su ventana, y
   el último cuadro de cada escena es el que había en el original en `hasta`. Los sonidos no se estiran (son voces).
   Solo transform y opacity, como el original: la fachada no agrega propiedades, la cámara es scale. */
(() => {
  'use strict';

  /** fachada de D: tiempos × k desde T, nada a partir de `fin` */
  function acelerar(D, T, k, fin) {
    const at = p => (typeof p === 'number' ? T + (p - T) * k : p);
    const vale = p => typeof p !== 'number' || at(p) < fin - 1e-6;
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
      to: (t, v, p) => (vale(p) ? tl.to(t, sv(v), at(p)) : tl),
      set: (t, v, p) => (vale(p) ? tl.set(t, v, at(p)) : tl),
      fromTo: (t, a, b, p) => (vale(p) ? tl.fromTo(t, a, sv(b), at(p)) : tl),
      call: (f, a, p) => (vale(p) ? tl.call(f, a, at(p)) : tl),
      duration: () => tl.duration(),
      time: (...a) => tl.time(...a),
    };
    W.scene = (name, html) => { const s = D.scene(name, html); secciones.push(s); return s; };
    W.sfx = (name, p, ...a) => { if (vale(p)) D.sfx(name, at(p), ...a); };
    W.call = (f, p) => { if (vale(p)) D.call(f, at(p)); };
    W.show = (el, p) => D.show(el, Math.min(at(p), fin));
    W.hide = (el, p) => D.hide(el, Math.min(at(p), fin));
    W.hit = (el, a, b, p) => { if (vale(p)) D.hit(el, a, sv(b), at(p)); };
    W.shake = (p, dur = 0.5, amp, grow) => { if (vale(p)) D.shake(at(p), dur * k, amp, grow); };
    W.flash = (p, peak, dur = 0.6, c) => { if (vale(p)) D.flash(at(p), peak, dur * k, c); };
    return { W, secciones };
  }

  Trailer.recipe('hdr-corte', (D, T, o) => {
    const receta = Trailer.recipes[o.de];
    if (!receta) throw new Error(`hdr-corte: no existe la receta "${o.de}"`);
    const k = o.k ?? 0.5, hasta = o.hasta ?? o.base, dur = +(hasta * k).toFixed(6), fin = T + dur;
    const { W, secciones } = acelerar(D, T, k, fin);
    const devuelve = receta(W, T, { ...o, type: o.de, dur: o.base });
    if (Math.abs(devuelve - o.base) > 0.001) throw new Error(`hdr-corte: ${o.de} dura ${devuelve} s y base dice ${o.base} s`);

    secciones.forEach(s => {
      // una escena que en el original arrancaba la película se ve desde el armado (gsap.set): acá espera su turno
      if (T > 0) gsap.set(s, { autoAlpha: 0 });
      D.hide(s, fin);
      const desde = o.golpe ? T + 0.4 : T;
      D.tl.set(s, { scale: 1 + (o.golpe || 0) }, T);
      if (o.golpe) D.tl.to(s, { scale: 1, duration: 0.4, ease: 'expo.out' }, T);
      if (o.empuje) D.tl.to(s, { scale: o.empuje, duration: fin - desde, ease: 'none' }, desde);
    });
    if (o.destello) D.flash(T, o.destello, 0.5);
    (o.extra || []).forEach(x => {
      const fn = Trailer.remix && Trailer.remix[x.tipo];
      if (!fn) throw new Error(`hdr-corte: no existe la superposición "${x.tipo}"`);
      fn(D, T + (x.at || 0), fin, x);
    });
    return dur;
  });
})();
