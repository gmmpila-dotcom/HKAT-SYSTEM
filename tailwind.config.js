import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                serif: ['"Playfair Display"', 'Georgia', 'serif'],
            },
            colors: {
                eggshell: '#FAF3DD',
                icyAqua: '#B8F2E6',
                sage: '#E5EFD9',
                aqua: '#B3DFDF',
                creamgreen: '#EAF1D1',
                darkteal: '#006B6B',
                sage2: '#8FB27A',
                graybubble: '#D9D9D9',
            },
            borderWidth: {
                '1.5': '1.5px',
            },
            borderRadius: {
                '3xl': '1.5rem',
            },
        },
    },

    plugins: [forms],
};
