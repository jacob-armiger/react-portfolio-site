import defaultTheme from 'tailwindcss/defaultTheme'
/** @type {import('tailwindcss').Config} */

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
            fontFamily: {
                sans: ['Inter Variable', ...defaultTheme.fontFamily.sans],
                serif: ["Playfair Display Variable", ...defaultTheme.fontFamily.serif]
            },
            colors: {
                // 'custom': '#5a6f91',
                // 'custom': '#faf9f6',
                'custom': '#E2E6E7',
                // 'fade': '#373737',
                'fade': '#3b3b3b',
                // 'accent': 'white',
            },
        },
	},
	plugins: [
        require('@tailwindcss/typography'),
    ],
}
