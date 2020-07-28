const path = require('path')

module.exports = {
	alias: {
		// Vite makes us alias a file path with '/'
		// https://github.com/vitejs/vite/blob/master/src/node/config.ts#L50
		'/vu/': path.resolve(__dirname, 'src')
	},
	optimizeDeps: {
		include: [
			'lit-html/directives/async-replace',
			'lit-html/directives/async-append',
			'lit-html/directives/cache',
			'lit-html/directives/class-map',
			'lit-html/directives/guard',
			'lit-html/directives/if-defined',
			'lit-html/directives/repeat',
			'lit-html/directives/style-map',
			'lit-html/directives/until',
		]
	}
}