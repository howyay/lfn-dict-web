// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages: 把 USERNAME/REPO 换成你的实际值
export default defineConfig({
  site: 'https://howyay.github.io',
  base: '/lfn-dict-web',
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
});
