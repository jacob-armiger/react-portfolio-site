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
                'primary': 'hsl(0,0%,23%)',         // text
                'secondary': "hsl(192,9%,90%)",     //background

                // 'primary-dark': "hsl(0,0%,77%)",     // text
                // 'secondary-dark': "hsl(192,9%,10%)", //background

                'primary-dark': "hsl(58, 10%, 77%)",        // text
                'secondary-dark': "hsl(192,8%,10%)",        //background
                'primary-dark-bright': "hsl(58, 10%, 95%)", // special text and buttons
            },
        },
	},
	plugins: [
        require('@tailwindcss/typography'),
        // function ({ addComponents, theme }) {
        //     addComponents ({
        //         '.bg-custom': {
        //             dark:
        //         }
        //     })
        // }
    ],
}
