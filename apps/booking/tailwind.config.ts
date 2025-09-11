import type { Config } from 'tailwindcss'
import sharedPreset from '../../packages/shared/tailwind-preset'

export default {
  presets: [sharedPreset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,html}',
    '../../packages/shared/src/**/*.{ts,tsx}'
  ]
} satisfies Config
