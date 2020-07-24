const express = require('express')
const restify = require('express-restify-mongoose')

const router = express.Router()
const { deleteProp, auth, block, sendRes } = require('../utilities/router')
const { Usuario } = require('../models/usuario')

restify.serve(router, Usuario, {
  access: () => 'protected',
  preCreate: [
    auth.isAdmin,
    async (req, _, next) => {
      await Usuario.getPasswordHash(req.body)
      return next()
    },
  ],
  postCreate: [], // TODO enviar email al crear
  preDelete: [block], // Para dar de baja la cuenta de uno desde auth
  preUpdate: [
    auth.isAdmin,
    deleteProp,
    async (req, res, next) => {
      const usuario = req.body
      if (req.user._id.equals(usuario._id)) {
        return sendRes(res, 401, 'Unauthorized', 'Error')
      }
      if (typeof usuario.password === 'string') {
        await Usuario.getPasswordHash(req.body)
      }
      return next()
    },
  ],
  postUpdate: [], // TODO enviar email al crear
  preRead: [auth.isAdmin],
})

module.exports = router
