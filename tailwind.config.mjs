import defaultTheme from 'tailwindcss/defaultTheme'
/** @type {import('tailwindcss').Config} */

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
            fontFamily: {
                sans: ['Inter Variable', ...defaultTheme.fontFamily.sans],
                serif: ['"Source Serif 4 Variable"', ...defaultTheme.fontFamily.serif],
                display: ['"Castoro Titling"', ...defaultTheme.fontFamily.serif]
            },
            colors: {
                'primary': 'hsl(0,0%,23%)',         // text
                'secondary': "hsl(192,9%,90%)",     //background

                // 'primary-dark': "hsl(0,0%,77%)",     // text
                // 'secondary-dark': "hsl(192,9%,10%)", //background

                'primary-dark': "hsl(58, 10%, 83%)",        // text
                'secondary-dark': "hsl(192,8%,10%)",        //background
                'primary-dark-bright': "hsl(58, 10%, 93%)", // special text and buttons
            },
        },
	},
	plugins: [
        require('@tailwindcss/typography'),
        function ({ addUtilities, theme }) {
            const displayFontFamily = theme('fontFamily.display')
            const displayFontFamilyValue = Array.isArray(displayFontFamily)
                ? displayFontFamily.join(', ')
                : displayFontFamily
            const sansFontFamily = theme('fontFamily.sans')
            const sansFontFamilyValue = Array.isArray(sansFontFamily)
                ? sansFontFamily.join(', ')
                : sansFontFamily

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
                '.hero-title': {
                    fontFamily: sansFontFamilyValue,
                    fontWeight: '300',
                    '--hero-font-size': '1.875rem',
                    '--hero-font-size-sm': '3rem',
                    '--hero-font-size-md': '4.5rem',
                    '--hero-font-size-2xl': '4rem',
                    '--hero-line-height': '1.1',
                    '--hero-line-height-sm': '1.14',
                    '--hero-line-height-lg': '1.25',
                    '--hero-linebox-px': '0.5rem',
                    '--hero-linebox-py': '0em',
                    '--hero-linebox-text-offset': '0.01em',
                    fontSize: 'var(--hero-font-size)',
                    lineHeight: 'var(--hero-line-height)',
                    // textShadow: '0 3px 12px rgba(0,0,0,0.45)',
                    '@screen sm': {
                        fontSize: 'var(--hero-font-size-sm)',
                        lineHeight: 'var(--hero-line-height-sm)',
                    },
                    '@screen md': {
                        fontSize: 'var(--hero-font-size-md)',
                    },
                    '@screen lg': {
                        lineHeight: 'var(--hero-line-height-lg)',
                    },
                    '@screen 2xl': {
                        fontSize: 'var(--hero-font-size-2xl)',
                    },
                },
                '.hero-linebox': {
                    display: 'inline',
                    backgroundColor: 'rgba(0,0,0,1)',
                    paddingInline: 'var(--hero-linebox-px)',
                    paddingBlock: 'var(--hero-linebox-py)',
                    lineHeight: '1',
                    boxDecorationBreak: 'clone',
                    WebkitBoxDecorationBreak: 'clone',
                },
                '.hero-linebox-text': {
                    position: 'relative',
                    top: 'var(--hero-linebox-text-offset)',
                },
            });
        },
    ],
}
