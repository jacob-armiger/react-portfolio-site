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
            },
            colors: {
                'primary': '#2A231B',
                'secondary': '#E5E2DA',
                'primary-dark': '#E5E2DA',
                'secondary-dark': '#26292C',
            },
        },
	},
	plugins: [
        require('@tailwindcss/typography'),
        function ({ addUtilities }) {
            addUtilities({
                '.page-top': {
                    marginTop: '1.5rem',
                    '@screen lg': {
                        marginTop: '0',
                        paddingTop: '2rem',
                    },
                },
            });
        },
    ],
}
