const mongoose = require('mongoose')
const escapeHtml = require('escape-html')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId
const saltRounds = 10

const { Roles } = require('../utilities/enums')
module.exports.PersonaRol = Roles

const schema = new Schema(
  {
    nombre: {
      type: String,
      trim: true,
      required: 'El nombre es requerido',
      set: escapeHtml,
    },
    apellido: {
      type: String,
      trim: true,
      required: 'El apellido es requerido',
      set: escapeHtml,
    },
    bibliography: { type: String, max: 500, trim: true /*, set: escapeHtml */ },
    email: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
      required: 'El mail es requerido',
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor, complete ingrese una dirección de correo electrónico válida',
      ],
    },
    email_verified: { type: Boolean, default: false },
    roles: [
      {
        type: String,
        default: Roles.CLIENTE,
        enum: Object.values(Roles),
        required: 'Rol es requerido',
      },
    ],
    servicios: [{ type: ObjectId, ref: 'habilidad' }],
    localidad: { type: ObjectId, ref: 'localidad' }, // Del trabajador
    google_account: { type: Object, access: 'protected' }, // Datos de google,
    picture: String,
    password: { type: String, access: 'protected' },
    show_tutorial: { type: Boolean, default: true },
    razon_social: { type: String, trim: true }, // O Nombre fisticio
    zona_trabajo: [{ type: ObjectId, ref: 'localidad' }], // libre todo el mundo
    // tags: [{ type: String, access: 'protected' }],
    notification: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)
schema.set('toJSON', { virtuals: true })

schema.virtual('display_name').get(function () {
  return this.razon_social || this.apellido + ' ' + this.nombre
})

schema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, saltRounds)
  } else next()
})

// Checks password match
schema.method('authenticate', function (password) {
  return bcrypt.compare(password, this.password)
})

schema.static('findOrCreate', function (condition, user, callback) {
  const self = this
  this.findOne(condition)
    .select('-password') // Selecciona todos los campos menos password
    .populate('servicios')
    .populate('localidad')
    .exec((err, result) => {
      if (err || result) {
        callback(err, result)
      } else {
        self.create(user, callback)
      }
    })
})

module.exports.Persona = mongoose.model('persona', schema)
