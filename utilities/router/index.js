const get = require('../get')
const auth = require('./routAuth')
const checkProps = require('./checkProps')
const sendRes = require('./sendRes')

/**
 * Normalizar parametros para el paginado
 *
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
const queryPage = (req, _, next) => {
  // en caso de no estar definido se fuersa a 0
  const skip = get(req, 'query.skip', 0)
  // en caso de no estar definido se fuersa a 15
  let limit = get(req, 'query.limit', 15)
  limit = parseInt(limit, 10)
  req.query.skip = parseInt(skip, 10)
  req.query.limit = limit > 0 ? limit : 15
  // Continuar con la consulta ala API
  return next()
}

const deleteProp = (req, _, next) => {
  const entity = req.body
  // delete entity.deleted;
  delete entity.createdAt
  delete entity.__v
  entity.updatedAt = new Date()
  if (req.user) {
    entity.updatedBy = req.user._id
  }
  if (entity.deleted) {
    entity.deletedBy = req.user._id
  }
  // delete muni.updatedAt;
  return next()
}

const block = (_, res) => sendRes(res, 404)

module.exports = {
  ...checkProps,
  queryPage,
  sendRes,
  deleteProp,
  block,
  auth,
}
