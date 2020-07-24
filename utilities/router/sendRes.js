/**
 * sendRes
 *
 * Solo con el objetivo de enviar siempre una misma respuesta
 * @param {ExpressResponse} res
 * @param {String} cod Response Status Cod
 * @param {any} dataOrError, Response Data
 * @param {String} message Response Message
 * @returns {{data:any,message:string}}
 */
const sendRes = (res, cod = 200, dataOrError, message) => {
  res.status(cod)
  return res.json({
    data: dataOrError,
    message: message || (cod === 200 ? 'Success' : undefined),
  })
}
module.exports = sendRes
