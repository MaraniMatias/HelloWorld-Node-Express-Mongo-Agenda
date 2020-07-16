const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const schema = new Schema({
  cod_postal: { type: Number, required: true },
  nombre: { type: String, trim: true, required: true },
  provincia: { type: ObjectId, ref: 'provincia' },
  coordenadas: {
    lat: { type: String, trim: true, required: 'Latitud requerida' },
    lon: { type: String, trim: true, required: 'Longitud requerida' },
  },
})
schema.set('toJSON', { virtuals: true })

module.exports.Localidad = mongoose.model('localidad', schema)

/*
{
    "_id" : ObjectId("5e82a694c31fc7ae07934132"),
    "cod_postal" : 2170,
    "nombre" : "Casilda",
    "coordenadas" : {
        "lat" : -33.0471741,
        "lon" : -61.1860337
    }
}
{
    "_id" : ObjectId("5e82a7cec31fc7ae0793417c"),
    "cod_postal" : 2000,
    "nombre" : "Rosario",
    "coordenadas" : {
        "lat" : -32.9521898,
        "lon" : -60.7666799
    }
}
*/
