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
     * Replaces the @fontsource-variable/* imports that used to sit in Layout.astro.
     * Astro downloads and self-hosts these, generates fallback metrics to limit
     * layout shift, and emits the preload links. The cssVariable names are what
     * src/styles/global.css points --font-sans / --font-serif / --font-playfair at.
     */
    /*
     * `weights` is not optional here. It defaults to 400, whereas the
     * @fontsource-variable/* packages this replaced shipped the whole variable
     * axis. Without these ranges every font-semibold / font-bold / font-extrabold
     * on the site gets a browser-synthesised faux bold instead of a real weight.
     */
    fonts: [
        {
            provider: fontProviders.fontsource(),
            name: 'Inter',
            cssVariable: '--font-inter',
            weights: ['100 900'],
        },
        /*
         * Both of these are serif faces, so they need an explicit serif fallback.
         * Astro's default fallback chain ends in `sans-serif`, which would render
         * these as sans-serif whenever the webfont fails rather than degrading to
         * Georgia. The trailing generic is also what Astro generates the optimized
         * metric fallback from.
         */
        {
            provider: fontProviders.fontsource(),
            name: 'Source Serif 4',
            cssVariable: '--font-source-serif',
            weights: ['200 900'],
            fallbacks: ['Georgia', 'serif'],
        },
        {
            provider: fontProviders.fontsource(),
            name: 'Playfair Display',
            cssVariable: '--font-playfair-display',
            weights: ['400 900'],
            fallbacks: ['Georgia', 'serif'],
        },
    ],
});