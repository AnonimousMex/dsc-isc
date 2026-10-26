import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';
import sharedPreset from '@dsc-isc/shared/tailwind-preset';

export default {
  presets: [sharedPreset as Config],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: { colors: { elevated: '#111315', surface: '#1a1d20', muted: '#a5abb2' } },
  },
  plugins: [typography],
} satisfies Config;
