import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseKeymap } from './scripts/keymap.mjs'
const source = resolve('config/corneish_zen.keymap')
export default defineConfig({
  root: 'viewer',
  base: process.env.VIEWER_BASE_PATH || '/',
  build: { outDir: '../dist', emptyOutDir: true },
  plugins: [
    {
      name: 'zen-keymap',
      resolveId(id) {
        if (id === 'virtual:keymap') return '\0virtual:keymap'
      },
      load(id) {
        if (id === '\0virtual:keymap') {
          this.addWatchFile(source)
          return `export default ${JSON.stringify(parseKeymap(readFileSync(source, 'utf8')))}`
        }
      },
      handleHotUpdate(ctx) {
        if (ctx.file === source) {
          const mod = ctx.server.moduleGraph.getModuleById('\0virtual:keymap')
          if (mod) ctx.server.moduleGraph.invalidateModule(mod)
          ctx.server.ws.send({ type: 'full-reload' })
        }
      },
    },
  ],
})
