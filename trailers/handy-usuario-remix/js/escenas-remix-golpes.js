/* HANDY USUARIO REMIX — golpes de palabras ('hdr-golpe') y el sello REMIX (Trailer.remix.sello).
   PROVISORIO: una tarjeta por palabra, hasta que llegue la versión de verdad. */
(() => {
  'use strict';
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  const esc = s => String(s).replace(/[&<>"]/g, c => ESC[c]);
  Trailer.recipe('hdr-golpe', (D, T, o) => {
    const palabras = o.palabras || [];
    const s = D.scene('golpe', palabras.map((p, i) =>
      `<div class="hdr-ph c" data-i="${i}" style="font:900 200px/1 Inter;color:#1F57A8">${esc(p.texto)}</div>`).join(''));
    const els = D.$$('.hdr-ph', s);
    gsap.set(els, { autoAlpha: 0 });
    D.show(s, T);
    palabras.forEach((p, i) => {
      D.tl.set(els[i], { autoAlpha: 1 }, T + p.at);
      if (i) D.tl.set(els[i - 1], { autoAlpha: 0 }, T + p.at);
    });
    D.hide(s, T + o.dur);
    return o.dur;
  });
  window.Trailer.remix = Object.assign(window.Trailer.remix || {}, {
    sello(D, at, fin) {
      const s = D.scene('sello', '<div class="hdr-ph c" style="font:900 90px/1 Inter;color:#1F57A8;top:200px">REMIX</div>');
      D.show(s, at);
      D.hide(s, fin);
    },
  });
})();
