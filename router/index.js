const fs = require('fs')
const path = require('path')

// Export the server middleware
// path: '/api/' + file.replace(/\.js$/, ''),
module.exports.setTo = function (app) {
  fs.readdirSync(__dirname).map((fileName) => {
    if (fileName !== 'index.js') {
      console.log('Load router', fileName)
      app.use(require(path.join(__dirname, fileName)))
    }
  })
}
