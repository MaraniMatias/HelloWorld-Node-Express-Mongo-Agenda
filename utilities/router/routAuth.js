const passport = require('passport')
const { sendRes } = require('.')

const isLogin = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    if (req.user) {
      return next()
    }
    return sendRes(res, 401, null, 'Unauthorized')
  },
]

const isAdmin = [
  // Para validar la autenticación con el token
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    if (req.user.role === 'ADMIN' || req.user.role === 'SYSTEM_ADMIN') {
      return next()
    }
    return sendRes(res, 401, null, 'Unauthorized')
  },
]

module.exports = { isLogin, isAdmin }
