// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
    integrations: [tailwind(), react(), mdx()],
    output: 'static',
    adapter: vercel({
        imageService: true,
    }),
    site: 'https://jacobarmiger.vercel.app'
});