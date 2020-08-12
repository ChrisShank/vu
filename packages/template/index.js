'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/template.cjs.prod.js')
} else {
  module.exports = require('./dist/template.cjs.js')
}
