// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
    integrations: [react(), mdx()],
    vite: {
        plugins: [tailwindcss()],
    },
    output: 'static',
    adapter: vercel(),
    site: 'https://jacobarmiger.vercel.app'
});