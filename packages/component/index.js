'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/component.cjs.prod.js')
} else {
  module.exports = require('./dist/component.cjs.js')
}
