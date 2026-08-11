import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /*
         * Paleta monocroma. Se conservan los mismos nombres que usa toda la
         * interfaz (brand, ink, sand) para no tocar 150 archivos: lo que cambia
         * es lo que significan. `sand` deja de ser el papel claro y pasa a ser
         * la superficie oscura; `ink` deja de ser la tinta y pasa a ser el
         * texto claro sobre negro.
         */
        brand: {
          DEFAULT: "#FFFFFF",
          50: "#FFFFFF",
          100: "#F7F7F7",
          200: "#EDEDED",
          300: "#DCDCDC",
          400: "#C9C9CC",
          500: "#FFFFFF",
          600: "#E4E4E4",
          700: "#CFCFCF",
          800: "#B4B4B4",
          900: "#8F8F96",
        },
        ink: {
          DEFAULT: "#F4F4F4",
          soft: "#C9C9CC",
          muted: "#8F8F96",
        },
        sand: {
          DEFAULT: "#0D0D0F",
          dark: "#262629",
        },
        olive: "#8F8F96",
      },
      fontFamily: {
        display: ['Oswald', 'Arial Narrow', 'system-ui', 'sans-serif'],
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        site: '1600px',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        fadeIn: 'fadeIn .5s ease-out both',
        slideUp: 'slideUp .45s ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config;
