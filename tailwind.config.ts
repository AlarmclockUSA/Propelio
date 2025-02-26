import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(15deg)' },
          '50%': { transform: 'translate(40px, 40px) rotate(15deg)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(15deg)' },
          '50%': { transform: 'translate(0, 60px) rotate(15deg)' },
        },
        'float-slower': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(-35deg)' },
          '50%': { transform: 'translate(60px, 0) rotate(-35deg)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
        'pulseWidth': {
          '0%, 100%': { opacity: '0.4', transform: 'scaleX(0.95)' },
          '50%': { opacity: '0.8', transform: 'scaleX(1.05)' },
        },
        'moveToCenter': {
          '0%': { opacity: '0', transform: 'translate(-50%, -50%) scale(0)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
        'moveAlongLine': {
          '0%': { left: '0%', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { left: '100%', opacity: '0' },
        },
        'spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        ...Array.from({ length: 20 }, (_, i) => ({
          [`float-particle-${i}`]: {
            '0%, 100%': {
              transform: 'translate(0, 0)',
              opacity: Math.random() * 0.5 + 0.3,
            },
            '50%': {
              transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`,
              opacity: Math.random() * 0.3 + 0.1,
            },
          },
        })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 5s ease-in-out infinite',
        'float-slower': 'float-slower 7s ease-in-out infinite',
        'wiggle': 'wiggle 3s ease-in-out infinite',
        'pulseWidth': 'pulseWidth 2s ease-in-out infinite',
        'moveToCenter': 'moveToCenter 0.5s ease-out forwards',
        'moveAlongLine': 'moveAlongLine 3s ease-in-out infinite',
        'spin': 'spin 10s linear infinite',
        ...Array.from({ length: 20 }, (_, i) => ({
          [`float-particle-${i}`]: `float-particle-${i} ${4 + Math.random() * 4}s ease-in-out infinite`,
        })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
      },
    },
  },
  plugins: [require('flowbite/plugin')],
} satisfies Config;
