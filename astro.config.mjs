import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';
import { env } from './src/env';

// https://astro.build/config
export default defineConfig({
  site: "http://localhost:4321",
  integrations: [react()],
  output: 'server',

  adapter: cloudflare({
    imageService: 'passthrough',
    platformProxy: {
      enabled: true,
    },
  }),

  env: env,

  vite: {
    plugins: [tailwindcss()],
  },
});