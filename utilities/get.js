'use strict'
/**
 * get
 *
 * De ser posible obtiene el valor de la propiedad el string de keys
 * o el valor setDefault en caso de no encontrar un valor
 *
 *  XXX
 *  Modificado para que siempre exita al propiedad
 *  undefined or null es igual
 *
 * @param object {Object}
 * @param keys {String}
 * @param setDefault {any}
 * @returns {object[keys]}
 */
function get(object, keys = '', setDefault) {
  const arrKeys = keys.split('.')
  const key = arrKeys[0]
  if (typeof key === 'undefined' && key === '') {
    return setDefault
  } else if (typeof object[key] !== 'undefined' && object[key] !== null) {
    return typeof arrKeys[1] !== 'undefined'
      ? get(object[key], keys.replace(`${key}.`, ''))
      : object[key]
  } else {
    return setDefault
  }
}
module.exports = get
