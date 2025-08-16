import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from "node:url";
import deno from "@deno/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [ preact(),deno(), tailwindcss()],
  resolve: {
    alias: {
      "@tangerie/deno_remote_sqlite/client": fileURLToPath(new URL("../client/mod.ts", import.meta.url))
    }
  }
})
