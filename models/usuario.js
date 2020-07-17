const mongoose = require('mongoose')
const escapeHtml = require('escape-html')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId
const saltRounds = 10

const Roles = {
  PRODUCTOR: 'PRODUCTOR',
  ADMIN: 'ADMIN',
}
module.exports.Roles = Roles

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
        default: Roles.PRODUCTOR,
        enum: Object.values(Roles),
        required: 'Rol es requerido',
      },
    ],
    external_account: { type: Object, access: 'protected' }, // Datos de google o facebook,
    picture: { type: String, trim: true, set: escapeHtml },
    password: { type: String, access: 'protected' },
    deleted: { type: Boolean, default: false },
    propducto: { type: ObjectId, ref: 'productor' },
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
    .populate('productor')
    .exec((err, result) => {
      if (err || result) {
        callback(err, result)
      } else {
        if (!user.roles || (user.roles && user.roles.length === 0)) {
          user.roles = [Roles.PRODUCTOR]
        }
        self.create(user, callback)
      }
    })
})

module.exports.Usuario = mongoose.model('usuario', schema)
