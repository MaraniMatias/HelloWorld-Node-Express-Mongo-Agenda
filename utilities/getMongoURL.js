module.exports = function () {
  const mongodbUser = process.env.MONGODB_USER || ''
  const mongoPass = process.env.MONGODB_PASSWORD || ''
  const mongodbName = process.env.MONGODB_DATABASE || 'testdb'
  let mongoURLLabel = 'mongodb://localhost/' + mongodbName
  if (
    process.env.NODE_ENV &&
    process.env.NODE_ENV === 'production' &&
    mongodbUser &&
    mongoPass
  ) {
    // Creo la conexion para MongoDB corriendo en el servidor
    mongoURLLabel = `mongodb://${mongodbUser}:${mongoPass}@${process.env.MONGODB_SERVICE_HOST}:${process.env.MONGODB_SERVICE_PORT}/${mongodbName}`
  }
  return mongoURLLabel
}
