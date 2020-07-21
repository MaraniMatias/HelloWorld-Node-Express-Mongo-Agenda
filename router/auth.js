const express = require('express')

const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const { sendRes, auth, check, checkErrors } = require('../utilities/router')
const { Usuario: User } = require('../models/usuario')

const { Agenda } = require('../utilities/agenda')

const verificarEamilSecret = 'QdVYGl3pXU562loudRC3_QTP1'
const sendEmailVerificarEamil = require('../utilities/agenda/send_email_verify_email.job')

const forgetPasswordSecret = 'QdVYGl3pXU562loudRC3_QTP2'
const sendEmailForgetPassword = require('../utilities/agenda/send_email_forget_password.job')

function sendForgetPassword(_id, email) {
  const t = jwt.sign({ _id, email }, forgetPasswordSecret, { expiresIn: '1h' })
  const queryString = encodeURI(`token=${t}&email=${email}`)
  sendEmailForgetPassword.jobCreate(Agenda, {
    email,
    link: `${process.env.FRONT_URL}/forget-password?${queryString}`,
  })
  return t
}

function sendVerifyEmail(_id, email) {
  const t = jwt.sign({ _id, email }, verificarEamilSecret, { expiresIn: '1h' })
  const queryString = encodeURI(`token=${t}&email=${email}`)
  sendEmailVerificarEamil.jobCreate(Agenda, {
    email,
    link: `${process.env.FRONT_URL}/login?${queryString}`,
  })
  return t
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
    failureRedirect: `${process.env.FRONT_URL}/callback.html?error=google_token`,
  }),
  (req, res) => {
    const token = passport.setTokeTo(res, { value: req.user._id })
    res.redirect(`${process.env.FRONT_URL}/callback.html?token=${token}`)
  }
)

// GET /api/auth/facebook
router.get(
  '/api/auth/facebook',
  passport.authenticate('facebook', {
    scope: ['email'],
    session: false,
  })
)

// GET /api/auth/facebook/callback
router.get(
  '/api/auth/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: `${process.env.FRONT_URL}/callback.html?error=google_token`,
  }),
  (req, res) => {
    const token = passport.setTokeTo(res, { value: req.user._id })
    res.redirect(`${process.env.FRONT_URL}/callback.html?token=${token}`)
  }
)

// POST /api/auth/login {mail password}
router.post(
  '/api/auth/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    if (req.user.provider !== 'local') {
      return sendRes(res, 404, null, `Inicie sescion con ${req.user.provider}`)
    }
    if (req.user.email_verified) {
      passport.setTokeTo(res, { value: req.user._id })
      return sendRes(res, 200, req.user)
    }
    return sendRes(res, 200, req.user, 'Email is not verified')
  }
)

// POST api/auth/logout
router.post('/api/auth/logout', (req, res) => {
  req.logout()
  return sendRes(res, 200)
})

// POST /api/auth/signup {Alta de un usuario}
router.post('/api/auth/signup', async (req, res) => {
  try {
    const errors = checkErrors([
      check(req.body, 'apellido').isString(),
      check(req.body, 'email').isEmail(),
      check(req.body, 'nombre').isString(),
      check(req.body, 'password').isPassword(),
    ])
    if (!errors) return sendRes(res, 400, errors, 'Body validation errors')

    const user = new User({
      apellido: req.body.apellido,
      email: req.body.email,
      nombre: req.body.nombre,
      password: req.body.password,
      // picture: '/avatars/matthew.png',
    })
    const userDB = await user.save()
    sendVerifyEmail(userDB._id, userDB.email)
    return sendRes(res, 200, null, 'User created, check your email')
  } catch (err) {
    if (err.code === 11000) {
      return sendRes(res, 400, null, 'Email ya registrado.')
    }
    return sendRes(res, 500, err, 'Error saving new user')
  }
})

// POST api/auth/signup/verification {token,email}
router.post('/api/auth/signup/verification', async (req, res) => {
  try {
    const errors = checkErrors([check(req.body, 'token').isString()])
    if (!errors) return sendRes(res, 400, errors, 'Body validation errors')

    const { _id, email } = jwt.verify(req.body.token, verificarEamilSecret)
    const user = await User.findOne({ _id, email, email_verified: false })
    if (user) {
      user.email_verified = true
      await user.save()
      return sendRes(res, 200)
    }
    return sendRes(res, 404, null, 'page not found')
  } catch (err) {
    return sendRes(res, 500, err, 'Error saving new user')
  }
})

// POST /api/auth/sendemail {email}
router.post('/api/auth/sendemail', async (req, res) => {
  try {
    const errors = checkErrors([check(req.body, 'email').isEmail()])
    if (!errors) return sendRes(res, 400, errors, 'Body validation errors')

    const user = await User.findOne({
      email: req.body.email,
      email_verified: false,
    })
    if (user) {
      sendVerifyEmail(user, user.email)
      return sendRes(res, 200)
    }
    return sendRes(res, 404, null, 'page not found')
  } catch (err) {
    return sendRes(res, 500, err, 'Error saving new user')
  }
})

// POST /api/auth/login {mail password}
router.post('/api/auth/forgetpassword', async (req, res) => {
  try {
    const errors = checkErrors([check(req.body, 'email').isEmail()])
    if (!errors) return sendRes(res, 400, errors, 'Body validation errors')

    const user = await User.findOne({ email: req.body.email })
    await user.save()
    sendForgetPassword(user._id, req.body.email)
    return sendRes(res, 200)
  } catch (err) {
    const cod = err.name === 'JsonWebTokenError' ? 404 : 500
    const message = cod === 404 ? 'page not found' : 'Error saving new user'
    return sendRes(res, cod, err, message)
  }
})

// TODO perdi la contraseña pero estoy logeado con facebook o Google
// POST api/auth/forgetpassword/change {token,email,password}
router.post('/api/auth/forgetpassword/change', async (req, res) => {
  try {
    const errors = checkErrors([
      check(req.body, 'token').isString(),
      check(req.body, 'password').isPassword(),
    ])
    if (!errors) return sendRes(res, 400, errors, 'Body validation errors')

    const { _id, email } = jwt.verify(req.body.token, forgetPasswordSecret)
    const user = await User.findOne({ _id, email })
    if (user) {
      user.password = req.body.password
      await user.save()
      return sendRes(res, 200)
    }
    return sendRes(res, 404, null, 'page not found')
  } catch (err) {
    const cod = err.name === 'JsonWebTokenError' ? 404 : 500
    const message = cod === 404 ? 'page not found' : 'Error saving new user'
    return sendRes(res, cod, err, message)
  }
})

// POST api/auth/forgetpassword/valid {token,email,password}
router.get('/api/auth/forgetpassword/valid', function (req, res) {
  try {
    const errors = checkErrors([check(req.query, 'token').isString()])
    if (!errors) return sendRes(res, 400, errors, 'Body validation errors')

    jwt.verify(req.query.token, forgetPasswordSecret)
    return sendRes(res, 200)
  } catch (err) {
    return sendRes(res, 404, err, 'page no found')
  }
})

// GET api/auth/me
router.get('/api/auth/me', auth.isLogin, (req, res) => {
  return sendRes(res, 200, req.user.toJSON())
})

module.exports = router
