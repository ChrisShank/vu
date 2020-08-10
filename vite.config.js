const path = require('path')

module.exports = {
	alias: {
		// Vite makes us alias a file path with '/'
		// https://github.com/vitejs/vite/blob/master/src/node/config.ts#L50
		'/vu/': path.resolve(__dirname, 'src')
	},
}