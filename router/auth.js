const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const { sendRes, auth, check, checkErrors } = require('../utilities/router')
const { Persona: User } = require('../models/persona')

const { Agenda } = require('../utilities/agenda')
const verificarEamilSecret = 'QdVYGl3pXU562loudRC3_QTP1'
const sendEmailVerificarEamil = require('../utilities/agenda/send_email_verify_email.job')
const forgetPasswordSecret = 'QdVYGl3pXU562loudRC3_QTP2'
const sendEmailForgetPassword = require('../utilities/agenda/send_email_forget_password.job')

function sendForgetPassword(_id, email) {
  const _t = jwt.sign({ _id, email }, forgetPasswordSecret, { expiresIn: '1h' })
  const queryString = encodeURI(`token=${_t}&email=${email}`)
  sendEmailForgetPassword.jobCreate(Agenda, {
    email,
    link: `${process.env.FRONT_URL}/forget-password?${queryString}`,
  })
  return _t
}

function sendVerifyEmail(_id, email) {
  const _t = jwt.sign({ _id, email }, verificarEamilSecret, { expiresIn: '1h' })
  const queryString = encodeURI(`token=${_t}&email=${email}`)
  sendEmailVerificarEamil.jobCreate(Agenda, {
    email,
    link: `${process.env.FRONT_URL}/login?${queryString}`,
  })
  return _t
}

// GET /api/auth/google
router.get(
  '/api/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
)

// GET /api/auth/google/callback
router.get(
  '/api/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: process.env.FRONT_URL + '/login?error=google_token',
    // sauccessRedirect: '/me',
  }),
  function (req, res) {
    const token = passport.setTokeTo(res, { value: req.user._id })
    res.redirect(process.env.FRONT_URL + '/login?token=' + token)
    // res.redirect('back')
    // res, status, data, message, error
    // return sendRes(res, 200, req.user.toJSON(), 'Success', null)
  }
)

// POST /api/auth/login {mail password}
router.post(
  '/api/auth/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    if (req.user.email_verified) {
      passport.setTokeTo(res, { value: req.user._id })
      // res, status, data, message, error
      return sendRes(res, 200, req.user, 'Success', null)
    } else {
      return sendRes(res, 200, req.user, 'Success', 'Email is not verified')
    }
  }
)

// POST api/auth/logout
router.post('/api/auth/logout', function (req, res) {
  req.logout()
  // res, status, data, message, error
  return sendRes(res, 200, null, 'Success', null)
})

// POST /api/auth/signup {Alta de un usuario}
router.post('/api/auth/signup', async function (req, res) {
  try {
    const isValid = checkErrors(res, [
      check(req.body, 'apellido').isString(),
      check(req.body, 'email').isEmail(),
      check(req.body, 'nombre').isString(),
      check(req.body, 'password').isPassword(),
    ])
    if (!isValid) return

    const user = new User({
      apellido: req.body.apellido,
      email: req.body.email,
      nombre: req.body.nombre,
      password: req.body.password,
      role: req.body.role,
      // picture: '/avatars/matthew.png',
    })
    const userDB = await user.save()
    sendVerifyEmail(userDB._id, userDB.email)
    return sendRes(res, 200, null, 'User created, check your email', null)
  } catch (err) {
    if (err.code === 11000) {
      return sendRes(res, 400, null, 'Error', 'Email ya registrado.')
    } else {
      return sendRes(res, 500, null, 'Error saving new user', err)
    }
  }
})

// POST api/auth/signup/verification {token,email}
router.post('/api/auth/signup/verification', async function (req, res) {
  try {
    const isValid = checkErrors([check(req.body, 'token').isString()])
    if (!isValid) return

    const { _id, email } = jwt.verify(req.body.token, forgetPasswordSecret)
    const user = await User.findOne({ _id, email, email_verified: false })
    if (user) {
      user.email_verified = true
      await user.save()
      return sendRes(res, 200, null, 'Success', null)
    } else {
      return sendRes(res, 404, null, 'page not found', null)
    }
  } catch (err) {
    return sendRes(res, 500, null, 'Error saving new user', err)
  }
})

// POST /api/auth/sendemail {email}
router.post('/api/auth/sendemail', function (req, res) {
  const isValid = checkErrors([check(req.body, 'email').isEmail()])
  if (!isValid) return
  return sendVerifyEmail(req.body.email)
    .then(() => {
      return sendRes(res, 200, null, 'Success', null)
    })
    .catch((err) => {
      return sendRes(res, 500, null, 'Error saving new user', err)
    })
})

// POST /api/auth/login {mail password}
router.post('/api/auth/forgetpassword', async (req, res) => {
  try {
    const isValid = checkErrors([check(req.body, 'email').isEmail()])
    if (!isValid) return

    const user = await User.findOne({ email: req.body.email })
    await user.save()
    sendForgetPassword(user._id, req.body.email)
    return sendRes(res, 200, null, 'Success', null)
  } catch (err) {
    const cod = err.name === 'JsonWebTokenError' ? 404 : 500
    const message = cod === 404 ? 'page not found' : 'Error saving new user'
    return sendRes(res, cod, null, message, err)
  }
})
// POST api/auth/forgetpassword/change {token,email,password}
router.post('/api/auth/forgetpassword/change', async function (req, res) {
  try {
    const isValid = checkErrors([
      check(req.body, 'token').isString(),
      check(req.body, 'password').isPassword(),
    ])
    if (!isValid) return

    const { _id, email } = jwt.verify(req.body.token, forgetPasswordSecret)
    const user = await User.findOne({ _id, email })
    if (user) {
      user.password = req.body.password
      await user.save()
      return sendRes(res, 200, null, 'Success', null)
    } else {
      return sendRes(res, 404, null, 'page not found', null)
    }
  } catch (err) {
    const cod = err.name === 'JsonWebTokenError' ? 404 : 500
    const message = cod === 404 ? 'page not found' : 'Error saving new user'
    return sendRes(res, cod, null, message, err)
  }
})
// POST api/auth/forgetpassword/valid {token,email,password}
router.get('/api/auth/forgetpassword/valid', function (req, res) {
  try {
    const isValid = checkErrors([check(req.query, 'token').isString()])
    if (!isValid) return

    jwt.verify(req.query.token, forgetPasswordSecret)
    return sendRes(res, 200, null, 'Success', null)
  } catch (err) {
    return sendRes(res, 404, null, 'page no found', err)
  }
})

// GET api/auth/me
router.get('/api/auth/me', auth.isLogin, function (req, res) {
  // res, status, data, message, error
  return sendRes(res, 200, req.user.toJSON(), 'Success', null)
})

module.exports = router
