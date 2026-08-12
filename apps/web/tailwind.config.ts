import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';
import sharedPreset from '@dsc-isc/shared/tailwind-preset';

export default {
  presets: [sharedPreset as Config],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [typography],
} satisfies Config;
