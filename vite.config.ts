import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

/** Every page of the site: the hub plus each trailers/<id>/index.html and legacy/<id>/index.html. */
function pages(): Record<string, string> {
  const input: Record<string, string> = { hub: resolve(root, 'index.html') };
  for (const dir of ['trailers', 'legacy']) {
    for (const id of readdirSync(resolve(root, dir))) {
      const html = resolve(root, dir, id, 'index.html');
      if (existsSync(html)) input[`${dir}/${id}`] = html;
    }
  }
  return input;
}

/** A local classic <script src> is not bundled by Vite and would 404 once deployed:
    fail the build and point to the adopt script instead. */
function requireModuleScripts(): Plugin {
  return {
    name: 'require-module-scripts',
    apply: 'build',
    transformIndexHtml(html, ctx) {
      const classic = [...html.matchAll(/<script\b(?![^>]*type="module")[^>]*\bsrc="(?!https?:)([^"]+)"/g)].map(m => m[1]);
      if (classic.length) {
        throw new Error(`${ctx.path} loads classic scripts (${classic.join(', ')}). Run: npm run adopt -- ${ctx.path.replace(/^\/|\/index\.html$/g, '')}`);
      }
    },
  };
}

export default defineConfig({
  // relative URLs: the build works from any sub-path (GitHub Pages serves it under /<repo>/)
  base: './',
  plugins: [requireModuleScripts()],
  build: {
    rolldownOptions: { input: pages() },
    // each trailer bundles its whole recipe library (some include map and data tables)
    chunkSizeWarningLimit: 1500,
  },
});
