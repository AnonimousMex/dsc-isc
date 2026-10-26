import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';
import sharedPreset from '@dsc-isc/shared/tailwind-preset';

export default {
  presets: [sharedPreset as Config],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        elevated: '#111715',
        surface: '#19221d',
        muted: '#9aa99f',
        line: 'rgb(48 65 55 / <alpha-value>)',
      },
    },
  },
  plugins: [typography],
} satisfies Config;
