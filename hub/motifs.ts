/* Trailer Hub — poster art: colour helpers + one generative SVG motif per trailer (viewBox 0 0 160 90).
   Shared by hub/main.ts (the library cards) and by the Node tools in trailers/<id>/tools that render the
   hub's posters (Node >= 22.18 imports it directly, stripping the types). */

// ---------------------------------------------------------------- colour
export const rgb = (h: string): number[] => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
export const lum = (h: string): number => { const [r, g, b] = rgb(h).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)) as [number, number, number]; return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const textOn = (bg: string): string => (lum(bg) > 0.18 ? '#0e0e10' : '#f2ede4');

// ---------------------------------------------------------------- poster motifs (viewBox 0 0 160 90)
// One shared seeded RNG: posters are drawn in catalog order, so every load draws the same art.
let seed = 11;
const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const blob = (cx: number, cy: number, r: number, k: number) => {
  const pts = Array.from({ length: 9 }, (_, i): [number, number] => {
    const a = (i / 9) * Math.PI * 2, d = r * (1 + 0.16 * Math.sin(3 * a + k) + 0.08 * Math.cos(5 * a));
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d];
  });
  let d = `M${pts[0]![0].toFixed(1)},${pts[0]![1].toFixed(1)}`;
  for (let i = 0; i < 9; i++) {
    const p0 = pts[(i + 8) % 9]!, p1 = pts[i]!, p2 = pts[(i + 1) % 9]!, p3 = pts[(i + 2) % 9]!;
    d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
};
const cube = (x: number, y: number, s: number, top: string, left: string, right: string) =>
  `<path d="M${x},${y - s} L${x + s},${y - s / 2} L${x},${y} L${x - s},${y - s / 2}Z" fill="${top}"/>` +
  `<path d="M${x - s},${y - s / 2} L${x},${y} L${x},${y + s} L${x - s},${y + s / 2}Z" fill="${left}"/>` +
  `<path d="M${x + s},${y - s / 2} L${x},${y} L${x},${y + s} L${x + s},${y + s / 2}Z" fill="${right}"/>`;

/** Poster colours: a = accent, b = detail, fg = text colour that reads on the poster background. */
export interface MotifColors { a: string; b: string; fg: string }

export const MOTIFS = {
  shapes: ({ a, b }) => `<circle cx="104" cy="38" r="19" fill="${a}"/><rect x="117" y="33" width="27" height="27" fill="${b}" transform="rotate(14 130 46)"/><path d="M84 66 L100 38 L116 66Z" fill="#ffc21a"/>`,
  bauhaus: ({ a, b, fg }) => `<circle cx="116" cy="44" r="28" fill="${a}"/><rect x="88" y="14" width="9" height="58" fill="${b}"/><path d="M116 16 A28 28 0 0 1 144 44 L116 44Z" fill="${fg}"/><line x1="78" y1="76" x2="156" y2="76" stroke="${fg}" stroke-width="1"/><circle cx="150" cy="18" r="4" fill="${b}"/>`,
  type: ({ b }) => `<text x="154" y="64" text-anchor="end" font-family="Archivo" font-weight="900" font-size="62" fill="none" stroke="${b}" stroke-width=".8">Aa</text><text x="148" y="60" text-anchor="end" font-family="Archivo" font-weight="900" font-size="62" fill="${b}">Aa</text>`,
  glitch: ({ a, b, fg }) => { let s = ''; for (let i = 0; i < 11; i++) { const y = 10 + i * 6.4, x = 70 + rand() * 40, w = 24 + rand() * 60; s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${(1.5 + rand() * 4).toFixed(1)}" fill="${[a, b, fg][i % 3]}" opacity="${i % 3 === 2 ? 0.5 : 0.95}"/>`; } return s; },
  blob: ({ a, b }) => `<path d="${blob(110, 44, 26, 0.6)}" fill="${a}"/><path d="${blob(132, 58, 15, 2)}" fill="${b}" style="mix-blend-mode:screen"/><path d="${blob(94, 22, 7, 1)}" fill="${b}" opacity=".8"/>`,
  particles: ({ a, b, fg }) => { let s = ''; for (let i = 0; i < 110; i++) { const r = Math.pow(rand(), 0.6) * 38, t = rand() * Math.PI * 2 + r * 0.08; s += `<circle cx="${(112 + Math.cos(t) * r * 1.3).toFixed(1)}" cy="${(45 + Math.sin(t) * r * 0.62).toFixed(1)}" r="${(0.4 + rand() * 1.3).toFixed(2)}" fill="${[a, b, fg][i % 3]}"/>`; } return s + `<circle cx="112" cy="45" r="3" fill="${fg}"/>`; },
  swarm: ({ a, fg }) => { let s = ''; for (let i = 0; i < 34; i++) { const x = 76 + i * 2.3 + rand() * 4, y = 45 + Math.sin(i * 0.33) * 22 + (rand() - 0.5) * 8, ang = Math.cos(i * 0.33) * 40 - 10; s += `<path d="M0,-2.2 L5,0 L0,2.2Z" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(0)})" fill="${i % 5 ? a : fg}"/>`; } return s; },
  tunnel: ({ a, b }) => { let s = ''; for (let i = 0; i < 8; i++) { const k = 1 - i * 0.12, w = 70 * k, h = 70 * k; s += `<rect x="${(112 - w / 2).toFixed(1)}" y="${(45 - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="none" stroke="${i % 2 ? b : a}" stroke-width="${(1.6 * k).toFixed(2)}" transform="rotate(${i * 9} 112 45)"/>`; } return s; },
  iso: ({ a, b, fg }) => cube(98, 52, 14, fg, a, b) + cube(126, 44, 11, fg, a, b) + cube(120, 70, 8, fg, a, b) + cube(144, 64, 6, fg, a, b),
  bars: ({ a, b, fg }) => [22, 34, 28, 46, 40, 58, 50].map((h, i) => `<rect x="${84 + i * 10}" y="${74 - h}" width="7" height="${h}" fill="${i === 5 ? b : a}"/>`).join('') + `<line x1="80" y1="74.5" x2="156" y2="74.5" stroke="${fg}" stroke-width="1"/><path d="M84 50 L100 42 L114 46 L130 26 L150 18" fill="none" stroke="${fg}" stroke-width="1.2"/>`,
  globe: ({ a, b, fg }) => `<circle cx="114" cy="45" r="30" fill="none" stroke="${fg}" stroke-width=".8" opacity=".6"/>` + [10, 20].map(rx => `<ellipse cx="114" cy="45" rx="${rx}" ry="30" fill="none" stroke="${fg}" stroke-width=".5" opacity=".35"/>`).join('') + [-15, 0, 15].map(dy => `<ellipse cx="114" cy="${45 + dy}" rx="${Math.sqrt(900 - dy * dy).toFixed(1)}" ry="4" fill="none" stroke="${fg}" stroke-width=".5" opacity=".35"/>`).join('') + `<path d="M96 52 Q112 12 134 36" fill="none" stroke="${a}" stroke-width="1.6"/><path d="M104 62 Q126 40 138 56" fill="none" stroke="${b}" stroke-width="1.2"/><circle cx="96" cy="52" r="2" fill="${a}"/><circle cx="134" cy="36" r="2" fill="${a}"/><circle cx="138" cy="56" r="2" fill="${b}"/>`,
  cart: ({ a, b, fg }) => `<path d="M84 22h9l7 30h34l6-22H98" fill="none" stroke="${fg}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="104" cy="62" r="4" fill="${fg}"/><circle cx="130" cy="62" r="4" fill="${fg}"/><circle cx="142" cy="20" r="9" fill="${b}"/><rect x="104" y="34" width="10" height="10" fill="${a}"/><path d="M118 44l6-10 6 10z" fill="${fg}"/><path d="M146 44 L146 58 L150 54 L153 61 L155 60 L152 53 L157 53Z" fill="${fg}"/>`,
  ui: ({ a, b, fg }) => `<rect x="78" y="16" width="76" height="54" rx="3" fill="${fg}" fill-opacity=".06" stroke="${fg}" stroke-opacity=".3"/><circle cx="84" cy="21" r="1.4" fill="${a}"/><circle cx="89" cy="21" r="1.4" fill="${b}"/><circle cx="94" cy="21" r="1.4" fill="${fg}"/><rect x="82" y="28" width="16" height="38" rx="1" fill="${fg}" fill-opacity=".1"/><path d="M104 56 L114 48 L124 52 L136 36 L148 40" fill="none" stroke="${a}" stroke-width="1.6"/>` + [0, 1, 2].map(i => `<rect x="${104 + i * 15}" y="28" width="12" height="6" rx="1" fill="${i === 1 ? b : fg}" fill-opacity="${i === 1 ? 1 : 0.2}"/>`).join('') + `<path d="M128 58 L128 68 L131 65 L134 70 L136 69 L133 64 L137 64Z" fill="${fg}"/>`,
  phone: ({ a, b, fg }) => `<rect x="104" y="8" width="38" height="76" rx="7" fill="${fg}" fill-opacity=".06" stroke="${fg}" stroke-opacity=".55" stroke-width="1.2"/><rect x="117" y="11" width="12" height="3" rx="1.5" fill="${fg}" opacity=".6"/><rect x="109" y="20" width="28" height="30" rx="3" fill="${a}"/><rect x="109" y="54" width="20" height="4" rx="1" fill="${fg}" opacity=".7"/><rect x="109" y="61" width="26" height="3" rx="1" fill="${fg}" opacity=".35"/><rect x="109" y="72" width="28" height="6" rx="3" fill="${b}"/>`,
  terminal: ({ a, b, fg }) => `<rect x="76" y="18" width="78" height="54" rx="3" fill="#000" fill-opacity=".45" stroke="${fg}" stroke-opacity=".2"/><text x="82" y="32" font-family="JetBrains Mono, monospace" font-size="6" fill="${a}">&gt; npm run deploy</text><text x="82" y="42" font-family="JetBrains Mono, monospace" font-size="5" fill="${fg}" opacity=".5">building… 1,284 modules</text><rect x="82" y="48" width="66" height="3" fill="${fg}" opacity=".15"/><rect x="82" y="48" width="44" height="3" fill="${b}"/><text x="82" y="62" font-family="JetBrains Mono, monospace" font-size="6" fill="${a}">✓ live _</text>`,
  noir: ({ a, fg }) => { let s = ''; for (let i = 0; i < 6; i++) s += `<path d="M${60 + i * 16},0 L${70 + i * 16},0 L${110 + i * 16},90 L${100 + i * 16},90Z" fill="${a}" opacity=".13"/>`; for (let i = 0; i < 26; i++) { const x = 70 + rand() * 90, y = rand() * 80; s += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - 2).toFixed(1)}" y2="${(y + 8).toFixed(1)}" stroke="${fg}" stroke-width=".4" opacity=".35"/>`; } return s + `<circle cx="126" cy="36" r="10" fill="#000"/><path d="M104 90 Q106 54 126 50 Q146 54 148 90Z" fill="#000"/>`; },
  cutout: ({ a, b }) => `<path d="M84 90 L96 20 L104 24 L100 60 L118 14 L126 18 L112 62 L138 26 L144 32 L118 72 L150 58 L152 66 L112 90Z" fill="${a}"/><path d="M126 8 L156 8 L156 30 L140 22Z" fill="${b}"/><circle cx="92" cy="14" r="5" fill="${b}"/>`,
  sun: ({ a, b }) => `<defs><linearGradient id="gsun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs><circle cx="116" cy="40" r="24" fill="url(#gsun)"/>` + [44, 50, 55, 59].map((y, i) => `<rect x="90" y="${y}" width="52" height="${1.2 + i * 0.7}" fill="var(--p0)"/>`).join('') + `<rect x="60" y="64" width="100" height="26" fill="var(--p0)"/>` + [-4, -2, -1, 0, 1, 2, 4].map(k => `<line x1="116" y1="64" x2="${116 + k * 22}" y2="90" stroke="${a}" stroke-width=".7"/>`).join('') + [66, 70, 76, 84].map(y => `<line x1="60" y1="${y}" x2="160" y2="${y}" stroke="${a}" stroke-width=".7"/>`).join(''),
  wave: ({ a, b }) => Array.from({ length: 19 }, (_, i) => { const h = 6 + Math.abs(Math.sin(i * 0.7) * 30) + (i % 4) * 3; return `<rect x="${80 + i * 4}" y="${(45 - h / 2).toFixed(1)}" width="2.4" height="${h.toFixed(1)}" rx="1.2" fill="${i % 5 === 2 ? b : a}"/>`; }).join(''),
  clock: ({ a, b }) => `<circle cx="118" cy="45" r="34" fill="none" stroke="${b}" stroke-width="1" stroke-dasharray="1 4"/><text x="118" y="64" text-anchor="middle" font-family="Archivo" font-weight="900" font-size="54" fill="${a}">03</text>`,
  lower: ({ a, b, fg }) => `<circle cx="92" cy="60" r="9" fill="${b}"/><rect x="104" y="52" width="50" height="9" fill="${a}"/><rect x="104" y="63" width="34" height="6" fill="${fg}" opacity=".8"/><rect x="104" y="30" width="3" height="16" fill="${a}"/><rect x="110" y="32" width="30" height="4" fill="${fg}" opacity=".5"/><rect x="110" y="40" width="20" height="3" fill="${fg}" opacity=".3"/>`,
  cards: ({ a, b, fg }) => `<rect x="96" y="14" width="34" height="56" rx="4" fill="${b}" transform="rotate(-14 113 42)"/><rect x="104" y="16" width="34" height="56" rx="4" fill="${a}" transform="rotate(2 121 44)"/><rect x="112" y="18" width="34" height="56" rx="4" fill="${fg}" transform="rotate(14 129 46)"/><text x="129" y="52" text-anchor="middle" font-family="Archivo" font-weight="900" font-size="14" fill="${a}" transform="rotate(14 129 46)">2026</text>`,
  film: ({ a, b, fg }) => `<rect x="66" y="26" width="94" height="38" fill="${fg}"/>` + Array.from({ length: 12 }, (_, i) => `<rect x="${69 + i * 8}" y="29" width="4" height="3" fill="var(--p0)"/><rect x="${69 + i * 8}" y="58" width="4" height="3" fill="var(--p0)"/>`).join('') + [0, 1, 2].map(i => `<rect x="${71 + i * 30}" y="35" width="26" height="20" fill="${i === 1 ? a : b}" opacity="${i === 1 ? 1 : 0.6}"/>`).join(''),
  branch: ({ a, b, fg }) => `<path d="M80 45 L104 45 L122 26 L150 26 M104 45 L122 64 L150 64 M122 26 L140 14 M122 64 L140 76" fill="none" stroke="${fg}" stroke-width="1.2" opacity=".6"/><circle cx="104" cy="45" r="4" fill="${fg}"/><circle cx="122" cy="26" r="3.4" fill="${a}"/><circle cx="122" cy="64" r="3.4" fill="${b}"/><circle cx="150" cy="26" r="2.4" fill="${a}"/><circle cx="150" cy="64" r="2.4" fill="${b}"/><circle cx="140" cy="14" r="2" fill="${a}"/><circle cx="140" cy="76" r="2" fill="${b}"/>`,
  // Handy: la Gota (ojitos y sonrisa) y un engranaje, con un destello amarillo de lamparita
  handy: ({ a, b, fg }) => {
    const gx = 141, gy = 57, R = 12.5, r = 9.4, n = 8, w = Math.PI / n, pt = (t: number, d: number) => `${(gx + Math.cos(t) * d).toFixed(2)},${(gy + Math.sin(t) * d).toFixed(2)}`;
    let gear = '';
    for (let i = 0; i < n; i++) { const c = i * 2 * w; gear += `${i ? 'L' : 'M'}${pt(c - 0.36 * w, R)}L${pt(c + 0.36 * w, R)}L${pt(c + 0.64 * w, r)}L${pt(c + 1.36 * w, r)}`; }
    const rays = 'M93 27 L88.5 22.5 M90 35 L84 34 M98 21 L97 15';
    return `<path d="${rays}" stroke="${a}" stroke-width="3.4" stroke-linecap="round"/><path d="${rays}" stroke="${b}" stroke-width="1.8" stroke-linecap="round"/>` +
      `<path d="${gear}Z" fill="${a}" transform="rotate(10 ${gx} ${gy})"/><circle cx="${gx}" cy="${gy + 3.4}" r="3.1" fill="#fff"/><circle cx="${gx - 3.6}" cy="${gy - 3.2}" r="1.3" fill="${fg}"/><circle cx="${gx + 3.6}" cy="${gy - 3.2}" r="1.3" fill="${fg}"/>` +
      `<path d="M108 19 C114 29 125 39 125 52 A17 17 0 0 1 91 52 C91 39 102 29 108 19Z" fill="#8ec5ff" stroke="${a}" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="99.5" cy="44" rx="2" ry="4.2" fill="#fff" opacity=".75" transform="rotate(24 99.5 44)"/>` +
      `<circle cx="102.5" cy="51" r="2.3" fill="${fg}"/><circle cx="113.5" cy="51" r="2.3" fill="${fg}"/><circle cx="103.2" cy="50.2" r=".75" fill="#fff"/><circle cx="114.2" cy="50.2" r=".75" fill="#fff"/><path d="M104 57 Q108 61 112 57" fill="none" stroke="${fg}" stroke-width="1.5" stroke-linecap="round"/>`;
  },
} satisfies Record<string, (c: MotifColors) => string>;

export type MotifName = keyof typeof MOTIFS;
