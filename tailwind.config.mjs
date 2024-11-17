/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {

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
