const mongoose = require('mongoose')

const { Schema } = mongoose
const { ObjectId } = mongoose.Schema.Types
const Localidad = require('./localidad')

const schema = new Schema({
  nombre: { type: String, trim: true, required: true },
  localidades: [{ type: ObjectId, ref: 'localidad', required: true }],
})
schema.set('toJSON', { virtuals: true })

schema.method('updateIdLocalidades', (callback) => {
  const provinciaID = this._id
  this.localidades.forEach((loc) => {
    Localidad.findById(loc, (error, localidad) => {
      if (error || !localidad) {
        callback(error, null)
      } else {
        /* eslint no-param-reassign: 0 */
        localidad.provincia = provinciaID
        localidad.save((err, localidadDB) => {
          if (err || !localidadDB) {
            callback(err, null)
          } else {
            callback(err, localidadDB)
          }
        })
      }
    })
  })
})

module.exports.Provincia = mongoose.model('provincia', schema)

/*
{
    "_id" : ObjectId("5e82a793c31fc7ae0793416d"),
    "localidades" : [
        ObjectId("5e82a7cec31fc7ae0793417c"),
        ObjectId("5e82a694c31fc7ae07934132")
    ],
    "nombre" : "Santa Fe"
}
*/
