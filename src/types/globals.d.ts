/* Globals shared between the TypeScript entry points and the trailer kit scripts (plain JS modules
   that communicate through window). */
import type * as THREE from 'three';
import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import type { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import type { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import type { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import type { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import type { LuminosityHighPassShader } from 'three/examples/jsm/shaders/LuminosityHighPassShader.js';
import type { TrailerEntry } from '../../hub/catalog';

declare global {
  interface Window {
    /** src/lib/three.ts — Three.js plus the postprocessing classes recipes-3d.js needs. */
    THREE: typeof THREE & {
      EffectComposer: typeof EffectComposer;
      RenderPass: typeof RenderPass;
      ShaderPass: typeof ShaderPass;
      UnrealBloomPass: typeof UnrealBloomPass;
      CopyShader: typeof CopyShader;
      LuminosityHighPassShader: typeof LuminosityHighPassShader;
    };
    /** The hub catalog, read by trailers that show the rest of the library (bifurcacion, export). */
    HUB_CATALOG: TrailerEntry[];
  }
}

export {};
