/* ============================================================================
   MUSIC MODULE — a synthesized groove under the whole film (no audio files).
   Config: music: { bpm: 120, anchor: 0, volume: 1, chords, riff, parts: [{ from, to, style }] }
   Styles:
     'groove' four-on-the-floor, claps on 2 & 4, off-beat hats, bouncy octave bass,
              plucked chord arpeggio and the bell riff every other bar;
     'drive'  the groove without the riff, busier hats (under dense scenes);
     'half'   half-time: kick 1 + "and" of 3, clap on 3, long bass notes;
     'soft'   hats + bass roots only (under talky scenes);
     'build'  kicks on every eighth, snare-roll claps, rising plucks (last bar before a hit);
     'hit'    one crash + boom + chord on `from`;
     'tension' no kick: a pulsing low root on every eighth + ticks (cold opens, breakdowns);
     'house'  four-on-the-floor, off-beat bass, sixteenth hats, chord stabs, the hook;
     'stutter' sixteenth glitches + a kick roll (the half bar before a drop);
     'walk'   noir jazz: a walking bass in quarters (root · third · fifth · chromatic approach),
              swung brushes, a soft rim on 2 & 4, a sparse piano voicing every other bar.
   Presets: Trailer.music.MINOR (Am – F – C – G) and RIFF_MINOR (A minor pentatonic).
   Chords default to C – G – Am – F (one per bar). Everything is placed on the master
   timeline at build time (the plugin's `done` hook), so it scrubs with the film.
   ========================================================================== */
(() => {
  'use strict';
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const CHORDS = [[48, 52, 55], [43, 47, 50], [45, 48, 52], [41, 45, 48]]; // C3 E3 G3 · G2 B2 D3 · A2 C3 E3 · F2 A2 C3
  // a 2-bar hook in C major pentatonic (midi, null = rest), eighth notes
  const RIFF = [76, null, 79, 81, 79, null, 76, 74, 72, null, 74, 76, null, 79, 76, null];
  const MINOR = [[45, 48, 52], [41, 45, 48], [48, 52, 55], [43, 47, 50]]; // Am · F · C · G
  const RIFF_MINOR = [76, null, 79, 81, 79, null, 76, 74, 72, null, 74, 76, null, 72, 69, null];

  function schedule(D, M) {
    const beat = 60 / (M.bpm || 120), e8 = beat / 2, anchor = M.anchor || 0, V = M.volume ?? 1;
    const chords = M.chords || CHORDS, riff = M.riff || RIFF;
    const sfx = (name, at, ...a) => D.sfx(name, at, ...a);
    (M.parts || []).forEach(p => {
      const st = p.style || 'groove', v = V * (p.volume ?? 1);
      if (st === 'hit') {
        sfx('crash', p.from, 0.3 * v);
        sfx('boom', p.from, 0.7 * v);
        chords[0].forEach(n => sfx('bell', p.from, hz(n + 24), 0.05 * v, 2));
        return;
      }
      const first = Math.ceil((p.from - anchor) / e8 - 1e-6), last = Math.floor((p.to - anchor) / e8 - 1e-6);
      for (let i = first; i <= last; i++) {
        const t = anchor + i * e8;
        if (t < p.from - 1e-6 || t >= p.to - 1e-6) continue;
        const bar = Math.floor(i / 8), e = ((i % 8) + 8) % 8, ch = chords[((bar % chords.length) + chords.length) % chords.length];
        const root = ch[0] - 12;
        if (st === 'groove' || st === 'drive') {
          if (e % 2 === 0) sfx('kick', t, 0.5 * v);
          if (e === 2 || e === 6) sfx('clap', t, 0.28 * v);
          if (e % 2 === 1) sfx('hat', t, 0.07 * v);
          if (st === 'drive' && e % 2 === 0) sfx('hat', t, 0.035 * v);
          const bassPat = { 0: 0, 3: 12, 4: 0, 6: 7, 7: 12 };
          if (e in bassPat) sfx('bass', t, hz(root + bassPat[e]), 0.26 * v);
          if (e % 2 === 1) sfx('plip', t, 0.03 * v, hz(ch[(e >> 1) % 3] + 24));
          // the hook answers in the second half of every 4-bar phrase
          const ph = ((bar % 4) + 4) % 4;
          if (st === 'groove' && ph >= 2) {
            const note = riff[(ph - 2) * 8 + e];
            if (note != null) sfx('bell', t, hz(note), 0.045 * v, 0.9);
          }
        } else if (st === 'half') {
          if (e === 0 || e === 5) sfx('kick', t, 0.45 * v);
          if (e === 4) sfx('clap', t, 0.26 * v);
          sfx('hat', t, (e % 2 ? 0.05 : 0.03) * v);
          if (e === 0) sfx('bass', t, hz(root), 0.3 * v);
          if (e === 0) ch.forEach(n => sfx('bell', t, hz(n + 12), 0.025 * v, 2.2));
        } else if (st === 'soft') {
          if (e % 2 === 1) sfx('hat', t, 0.045 * v);
          if (e === 0) sfx('bass', t, hz(root), 0.24 * v);
          if (e === 4) sfx('plip', t, 0.03 * v, hz(ch[1] + 24));
        } else if (st === 'tension') {
          sfx('bass', t, hz(root + (e === 7 ? 12 : 0)), (e % 2 ? 0.1 : 0.17) * v);
          if (e % 2 === 0) sfx('tick', t, 0.035 * v);
          if (e === 0 && bar % 2 === 0) ch.forEach(n => sfx('bell', t, hz(n + 12), 0.018 * v, 3));
        } else if (st === 'house') {
          if (e % 2 === 0) sfx('kick', t, 0.55 * v);
          if (e === 2 || e === 6) sfx('clap', t, 0.3 * v);
          sfx('hat', t, (e % 2 ? 0.09 : 0.035) * v);
          sfx('hat', t + e8 / 2, 0.03 * v);
          if (e % 2 === 1) sfx('bass', t, hz(root + (e === 7 ? 12 : 0)), 0.3 * v);
          if (e === 3 || e === 6) ch.forEach(n => sfx('bell', t, hz(n + 12), 0.022 * v, 0.35));
          const ph = ((bar % 4) + 4) % 4;
          if (ph >= 2) { const note = riff[(ph - 2) * 8 + e]; if (note != null) sfx('bell', t, hz(note), 0.045 * v, 0.8); }
        } else if (st === 'stutter') {
          sfx('glitch', t, 0.08, 0.12 * v);
          sfx('glitch', t + e8 / 2, 0.06, 0.09 * v);
          sfx('kick', t, 0.32 * v);
          sfx('kick', t + e8 / 2, 0.26 * v);
        } else if (st === 'walk') {
          const next = chords[(((bar + 1) % chords.length) + chords.length) % chords.length][0] - 12;
          if (e % 2 === 0) { const q = e >> 1, n = [root, ch[1] - 12, ch[2] - 12, next + (next > ch[2] - 12 ? -1 : 1)][q]; sfx('bass', t, hz(n), 0.24 * v); }
          sfx('hat', e % 2 ? t + e8 * 0.33 : t, (e % 2 ? 0.035 : 0.05) * v); // swung brushes
          if (e === 2 || e === 6) sfx('clap', t, 0.05 * v);
          if (e === 0 && bar % 2 === 0) ch.forEach((n, i) => sfx('bell', t + i * 0.03, hz(n + 12), 0.022 * v, 1.8));
        } else if (st === 'build') {
          sfx('kick', t, (0.3 + 0.3 * ((t - p.from) / Math.max(0.01, p.to - p.from))) * v);
          sfx('clap', t, 0.12 * v);
          sfx('plip', t, 0.04 * v, hz(60 + (i - first) * 2));
        }
      }
    });
  }
  Trailer.plugin({ done: (D, cfg) => { if (cfg.music) schedule(D, cfg.music); } });
  const NOIR = [[50, 53, 57], [43, 46, 50], [45, 49, 52], [50, 53, 57]]; // Dm · Gm · A · Dm
  Trailer.music = { schedule, hz, CHORDS, RIFF, MINOR, RIFF_MINOR, NOIR };
})();
