import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'

export default defineConfig({
  test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: './add-ons/setup-tests.ts',
		exclude: ['**/node_modules', '**/dist', '.idea', '.git', '.cache','**/lib', '**/out'],
	},
	build: {
		lib: {
			entry: resolve( __dirname, 'src/index.ts' ),
			name: 'entropic-bond-localize-react',
			fileName: 'entropic-bond-localize-react'
		},
		"outDir": "lib",
	},
	plugins: [
		dts()
	]
})
