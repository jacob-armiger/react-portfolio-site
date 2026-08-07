// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

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
    site: 'https://jacobarmiger.vercel.app',
    /*
     * Astro downloads and self-hosts these fonts, generates fallback metrics, and
     * emits preload links. global.css points --font-sans / --font-serif /
     * --font-playfair at the cssVariable names. `weights` must be explicit: the
     * default is 400 only, which turns font-semibold/bold into synthesized faux bold.
     *
     * display: 'block' instead of Astro's default 'swap'. This is an MPA, so every
     * navigation is a fresh document; under 'swap' each one repaints in the metric
     * fallback and then flips to the real face. 'block' holds text invisible for up
     * to ~3s rather than painting a substitute, so these faces are the only ones a
     * reader ever sees. A warm /_astro/fonts cache clears that window immediately;
     * a cold visit trades a brief blank for never rendering in Times.
     */
    fonts: [
        {
            provider: fontProviders.fontsource(),
            name: 'Inter',
            cssVariable: '--font-inter',
            weights: ['100 900'],
            display: 'block',
        },
        /*
         * Serif faces need explicit serif fallbacks: Astro's default chain ends in
         * sans-serif. The trailing generic also seeds the generated metric fallback.
         */
        {
            provider: fontProviders.fontsource(),
            name: 'Source Serif 4',
            cssVariable: '--font-source-serif',
            weights: ['200 900'],
            fallbacks: ['Georgia', 'serif'],
            display: 'block',
        },
        {
            provider: fontProviders.fontsource(),
            name: 'Playfair Display',
            cssVariable: '--font-playfair-display',
            weights: ['400 900'],
            fallbacks: ['Georgia', 'serif'],
            display: 'block',
        },
    ],
});