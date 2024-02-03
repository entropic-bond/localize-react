import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: './add-ons/setup-tests.ts',
		exclude: ['**/node_modules', '**/dist', '.idea', '.git', '.cache','**/lib', '**/out'],
	},
})
