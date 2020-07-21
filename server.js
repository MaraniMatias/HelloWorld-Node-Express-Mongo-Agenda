const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const compress = require('compression')
const cors = require('cors')
const express = require('express')

const app = express()
const favicon = require('serve-favicon')
const helmet = require('helmet')
const restify = require('express-restify-mongoose')
const auth = require('http-auth')
const statusMonitor = require('express-status-monitor')({
  path: '',
  title: 'Api Status',
})
const passport = require('./utilities/passport')
const { sendRes } = require('./utilities/router')
Object.assign = require('object-assign')

const isProd = process.env.NODE_ENV === 'production'

const getPathPublicWith = (addPath) => {
  return path.join.apply(null, [__dirname, 'public', addPath])
}

// Sobre escribe la informacion de las tecnologias usadas en backend
app.use(helmet())
app.use(helmet.xssFilter({ reportUri: '/report-xss-violation' }))
app.use(compress())

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize())
// app.all('/api/*', auth.isLogin)

// Parsear el cueropo de dato en POST
app.use(bodyParser.json(/* { limit: '12mb' } */))
app.use(bodyParser.urlencoded({ /*  limit: '12mb', */ extended: true }))
app.use(
  cors({
    origin: isProd ? process.env.FRONT_URL : true,
    exposedHeaders: ['X-Total-Count', 'Content-Type', 'Authorization'],
  })
)

// favicon
app.use(favicon(getPathPublicWith('favicon.ico')))
// Static, FronEnd
app.use(express.static(path.join.apply(null, [__dirname, 'public'])))

// System monitor
const basic = auth.basic({ realm: 'API Monitor' }, function (user, pass, next) {
  next(
    user === process.env.API_STATUS_USER && pass === process.env.API_STATUS_PASS
  )
})
app.use(statusMonitor.middleware)
app.get('/api/status', basic.check(statusMonitor.pageRoute))

restify.defaults({
  prefix: '/api',
  version: '',
  totalCountHeader: true,
  // lean: false,
  runValidators: true,
  onError: (err, req, res) =>
    sendRes(res, req.erm.statusCode, err.message, 'error'),
})

// Agregar routes
fs.readdirSync(path.join(__dirname, 'router')).forEach((fileName) => {
  if (fileName !== 'index.js') {
    console.log('Load router', fileName)
    /* eslint global-require: 0 import/no-dynamic-require: 0 */
    app.use(require(path.join(__dirname, 'router', fileName)))
  }
})

module.exports = app
