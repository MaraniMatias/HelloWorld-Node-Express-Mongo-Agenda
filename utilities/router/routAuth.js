const passport = require('passport')
const { sendRes } = require('.')

const isLogin = [
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    if (req.user) {
      return next()
    } else {
      return sendRes(res, 401, null, 'Unauthorized')
    }
  },
]

module.exports = { isLogin }
