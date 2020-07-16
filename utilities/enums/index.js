const capitalizeWords = require('./../capitalizeWords')

module.exports.Roles = {
  PRODUCTOR: 'PRODUCTOR',
  ADMIN: 'ADMIN',
}
module.exports.RolesLabel = Object.keys(this.Roles).map((key) => ({
  key,
  show: key !== this.Roles.ADMIN,
  label: capitalizeWords(key),
}))
