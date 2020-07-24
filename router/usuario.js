const express = require('express')
const restify = require('express-restify-mongoose')

const router = express.Router()
const { deleteProp, auth, sendRes } = require('../utilities/router')
const { Usuario } = require('../models/usuario')

restify.serve(router, Usuario, {
  preCreate: [auth.isAdmin],
  preDelete: [auth.isAdmin], // Para dar de baja la cuenta de uno desde auth
  preUpdate: [
    deleteProp,
    auth.isAdmin,
    (req, res, next) => {
      const usuario = req.body
      if (req.user._id.equals(usuario._id)) {
        return next()
      }
      return sendRes(res, 401, 'Unauthorized', 'Error')
    },
  ],
  preRead: [auth.isAdmin],
})

module.exports = router
