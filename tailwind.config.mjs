import defaultTheme from 'tailwindcss/defaultTheme'
/** @type {import('tailwindcss').Config} */

export default {
    darkMode: 'class',
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
            fontFamily: {
                sans: ['Inter Variable', ...defaultTheme.fontFamily.sans],
                serif: ['"Source Serif 4 Variable"', ...defaultTheme.fontFamily.serif],
                playfair: ['"Playfair Display Variable"', ...defaultTheme.fontFamily.serif],
                display: ['"Castoro Titling"', ...defaultTheme.fontFamily.serif]
            },
            colors: {
                'primary': '#26292C',
                'secondary': '#E5E2DA',
                'primary-dark': '#E5E2DA',
                'secondary-dark': '#26292C',
                'primary-dark-bright': '#E5E2DA',
            },
        },
	},
	plugins: [
        require('@tailwindcss/typography'),
        function ({ addUtilities }) {
            addUtilities({
                '.page-top': {
                    marginTop: '2rem',
                    '@screen lg': {
                        marginTop: '0',
                        paddingTop: '2rem',
                    },
                },
                // Subtle readability boost for light text over images.
                '.text-shadow-soft': {
                    textShadow: '0 2px 10px rgba(0,0,0,0.35)',
                },
                // Stronger hero treatment for the homepage banner.
                '.text-shadow-hero': {
                    textShadow: '0 3px 12px rgba(0,0,0,0.45)',
                },
                // Crisp edge when you want less glow and more separation.
                '.text-shadow-crisp': {
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                },
            });
        },
    ],
}
