const SECRET_KEY_SESSION = process.env.SECRET_KEY_SESSION || 'M4r4n1M47n145'
const passportJWT = require('passport-jwt')
const jwt = require('jsonwebtoken')

const { ExtractJwt } = passportJWT
const JwtStrategy = passportJWT.Strategy
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const { Usuario } = require('../models/usuario')

// Config passport
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      if (process.env.NODE_ENV === 'development') {
        console.log({ accessToken, profile: profile._json })
      }
      const { email } = profile._json
      const user = {
        nombre: profile.name.givenName,
        apellido: profile.name.familyName,
        email,
        picture: profile._json.picture,
        provider: profile.provider,
        external_account: {
          id: profile.id,
          _json: profile._json,
          accessToken,
          refreshToken,
          gender: profile.gender,
          organizations: profile._json.organizations,
        },
      }
      Usuario.findOrCreate({ email }, user, (err, userDb) => {
        if (err || !userDb) return done(err, null)
        return done(err, userDb)
      })
    }
  )
)

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, next) => {
      try {
        // La validacion del elmail, lo hacemos des el endpoint su perrior
        const user = await Usuario.findOne({ email, deleted: false })
          .populate('productor')
          .populate('localidad')
        if (user && user.provider !== 'local') {
          return next(null, user)
        }
        if (
          user &&
          user.estado === 'HABILITADO' &&
          (await user.authenticate(password))
        ) {
          user.password = null
          return next(null, user)
        }
        return next('Usuario o contraseña icorecta', false)
      } catch (err) {
        return next(err, false)
      }
    }
  )
)

passport.use(
  new JwtStrategy(
    {
      // Creates a new extractor that looks for the JWT in the authorization header with the scheme 'bearer'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: SECRET_KEY_SESSION,
      ignoreExpiration: process.env.NODE_ENV === 'development',
    },
    (jwtPayload, next) => {
      console.log('payload received', jwtPayload.value)
      // usually this would be a database call:
      Usuario.findById(jwtPayload.value)
        .select('-password') // Selecciona todos los campos menos password
        .populate('productor')
        .populate('localidad')
        .exec((err, user) => {
          if (err || !user) {
            return next(err, false)
          }
          return next(null, user)
        })
    }
  )
)

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'photos', 'first_name', 'last_name'],
    },
    (accessToken, refreshToken, profile, done) => {
      if (process.env.NODE_ENV === 'development') {
        console.log({ accessToken, profile: profile._json })
      }
      const { email } = profile._json
      const user = {
        nombre: profile.name.givenName,
        apellido: profile.name.familyName,
        email,
        picture: profile.photos[0].value,
        provider: profile.provider,
        external_account: {
          id: profile.id,
          _json: profile._json,
          accessToken,
          refreshToken,
        },
      }
      Usuario.findOrCreate({ email }, user, (err, userDb) => {
        if (err || !userDb) return done(err, null)
        return done(err, userDb)
      })
    }
  )
)

passport.serializeUser((user, cb) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('serializeUser', user.email)
  }
  cb(null, user._id)
})
passport.deserializeUser((id, cb) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('deserializeUser', id)
  }
  Usuario.findById(id, cb)
})

passport.setTokeTo = (res, { value }) => {
  const token = jwt.sign({ value }, SECRET_KEY_SESSION)
  res.setHeader('Authorization', `Bearer ${token}`)
  return token
}

module.exports = passport
