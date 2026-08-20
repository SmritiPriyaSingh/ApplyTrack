import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        workspace: {
          bg: '#0A0A0A',
          card: '#1A1A1A',
          cardHover: '#242424',
          brand: '#C3195D',
          brandHover: '#a5134d',
          accent: '#62929A',
          accentHover: '#527e86',
          text: '#EFECEC',
          textSecondary: '#BFC3C7',
          textMuted: '#737373',
          border: 'rgba(255, 255, 255, 0.08)',
          success: '#6CBF84',
          warning: '#E2B85C',
          danger: '#D96C6C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      }
    },
  },
  plugins: [],
};
export default config;
