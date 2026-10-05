/* Las fuentes del diseño 2026 de la app (src/handy/app/DISENO.md), empaquetadas con la página: funcionan sin red y
   también al exportar video. DM Sans para la interfaz; Archivo (eje de ancho, 125 % = expandida) para los títulos
   grandes. Define --hd-app-font y --hd-app-display en :root. Los titulares del tráiler (fuera del teléfono) siguen en
   Inter (--hd-font). Importarlo una vez desde cada componente de la app nueva (o desde su CSS base). */
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/archivo/wdth.css';

const raiz = document.documentElement.style;
raiz.setProperty('--hd-app-font', "'DM Sans Variable', 'DM Sans', system-ui, sans-serif");
raiz.setProperty('--hd-app-display', "'Archivo Variable', 'Archivo', 'DM Sans Variable', system-ui, sans-serif");

/** Para medir textos al construir (D.fit, anchos): esperar a que las dos fuentes estén listas. */
export const fuentesListas: Promise<unknown> = Promise.all([
  document.fonts.load("500 16px 'DM Sans Variable'"),
  document.fonts.load("800 16px 'DM Sans Variable'"),
  document.fonts.load("900 32px 'Archivo Variable'"),
]).catch(() => undefined);
