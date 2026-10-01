/* Tipos globales mínimos del Trailer Kit para los módulos TypeScript de Handy.
   Los scripts del kit (trailers/<id>/js/engine.js, audio.js, recipes-music.js) son JS y se comunican por
   window: window.Trailer (recetas y plugins), window.SFX (sonido) y window.trailer (lo publica el engine
   al terminar de armar la película). Acá está solo lo que usan src/handy/player.ts y los helpers de
   escenas: KitDirector es la "D" que recibe cada receta, KitScene una entrada de cfg.scenes. */

declare global {
  /** Una escena de cfg.scenes (js/trailer.js). */
  interface KitScene {
    /** nombre de la receta (Trailer.recipe) */
    type: string;
    /** etiqueta GSAP del inicio de la escena = capítulo del reproductor */
    id?: string;
    /** nombre del capítulo en la pantalla de pausa */
    titulo?: string;
    /** duración del storyboard en s: player.ts corta el build si la receta devuelve otra */
    dur?: number;
    [option: string]: unknown;
  }

  /** La configuración de Trailer.run() ya combinada con los valores por defecto del engine. */
  interface KitConfig {
    meta: { title: string; subtitle: string; hud: string; pageTitle?: string; back?: string };
    ui: Record<string, string>;
    palette: { night: string; ink: string; paper: string; accents: string[] };
    fonts: { display: string; mono: string; serif: string; stretch: boolean; preload?: string[] };
    lang?: string;
    locale: string;
    seed: number;
    stage?: { w: number; h: number };
    scenes?: KitScene[];
    /** Handy: URL del QR del cierre ('' = sin QR). En desarrollo, ?qr=<url> la pisa. */
    qrUrl?: string;
    music?: unknown;
    [key: string]: unknown;
  }

  /** La "D" del director: el primer argumento de cada receta (engine.js). */
  interface KitDirector {
    W: number;
    H: number;
    CX: number;
    CY: number;
    /** el timeline maestro: todo va acá, en tiempos absolutos */
    tl: GSAPTimeline;
    cfg: KitConfig;
    C: { night: string; ink: string; paper: string; a: string[]; spectrum: string[]; glow: string };
    /** aleatorio con semilla (nunca Math.random) */
    rand(): number;
    rnd(lo: number, hi: number): number;
    $(sel: string, root?: ParentNode): Element | null;
    $$(sel: string, root?: ParentNode): Element[];
    /** crea <section class="scene"> dentro de la cámara; los hijos .c quedan centrados */
    scene(name: string, html: string): HTMLElement;
    /** caja de un elemento en px del escenario, medida al armar */
    box(el: Element): { x: number; y: number; w: number; h: number };
    fit(el: HTMLElement, maxW: number): HTMLElement;
    /** un sonido de window.SFX en el timeline: D.sfx('plip', T + 1.5, 0.3, 520) */
    sfx(name: string, at: number, ...args: unknown[]): GSAPTimeline;
    call(fn: () => void, at: number): GSAPTimeline;
    show(el: gsap.TweenTarget, at: number): GSAPTimeline;
    hide(el: gsap.TweenTarget, at: number): GSAPTimeline;
    /** set + to en el mismo punto: un fromTo que se rebobina bien */
    hit(el: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars, at: number): void;
    flash(at: number, peak?: number, dur?: number, color?: string): void;
    shake(at: number, dur?: number, amp?: number, grow?: boolean): void;
    stage: HTMLElement;
    camera: HTMLElement;
    bg: HTMLElement;
    flashEl: HTMLElement;
  }

  /** Una receta: arma su escena en D.tl a partir de T y devuelve su duración en s. */
  type KitRecipe = (D: KitDirector, T: number, options: KitScene) => number;

  /** Un plugin del kit: setup antes de las escenas, scene después de cada una, done al final. */
  interface KitPlugin {
    setup?(D: KitDirector, cfg: KitConfig): void;
    scene?(D: KitDirector, T: number, options: KitScene, dur: number): void;
    done?(D: KitDirector, cfg: KitConfig): void;
  }

  /** Una entrada del mapa de escenas que el engine publica (data-scenes, window.trailer.map). */
  interface KitSceneEntry {
    type: string;
    label: string;
    start: number;
    dur: number;
    branch?: string;
  }

  /** Un capítulo del reproductor de Handy (una escena con id). */
  interface HandyCapitulo {
    /** número en pantalla, desde 1 (fichas de la pausa, teclas 1–9 y 0, ?escena=N) */
    n: number;
    /** etiqueta GSAP (= id de la escena) */
    id: string;
    titulo: string;
    /** inicio en s (= tl.labels[id]) */
    start: number;
    dur: number;
  }

  /** window.trailer: lo publica engine.js; player.ts le agrega los capítulos. */
  interface KitTrailerApi {
    tl: GSAPTimeline;
    map: KitSceneEntry[];
    D: KitDirector;
    callbacks(): { t: number; i: number; fn: () => void }[];
    renderAudio(o?: { sampleRate?: number; seed?: number }): Promise<AudioBuffer>;
    /** (player.ts) los capítulos en orden */
    capitulos?: readonly HandyCapitulo[];
    /** (player.ts) salta a un capítulo por id o por número (desde 1) y sigue reproduciendo */
    saltar?(capitulo: string | number): HandyCapitulo | null;
    /** (player.ts) el capítulo donde está el cabezal */
    capituloActual?(): HandyCapitulo | null;
  }

  /** window.SFX (audio.js): las voces se llaman por nombre desde D.sfx(); acá solo el control. */
  interface KitSFX {
    init(): Promise<void>;
    stopAll(fade?: number): void;
    suspend(): unknown;
    resume(): unknown;
    setMuted(muted: boolean): void;
    isMuted(): boolean;
    /** true mientras suena de verdad (contexto andando y sin silencio) */
    live(): boolean;
    [voice: string]: unknown;
  }

  interface Window {
    Trailer: {
      run(cfg: Record<string, unknown>): void;
      recipe(name: string, fn: KitRecipe): void;
      plugin(plugin: KitPlugin): void;
      recipes: Record<string, KitRecipe>;
      [module: string]: unknown;
    };
    SFX: KitSFX;
    trailer?: KitTrailerApi;
  }
}

export {};
