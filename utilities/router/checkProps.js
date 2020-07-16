'use strict'
const { sendRes, get } = require('../router/index')

function isDefined(prop) {
  return typeof prop !== 'undefined' && prop !== null
}

function check(object, keys = '') {
  const prop = get(object, keys, null)
  return {
    isDefined() {
      return isDefined(prop) || `${keys} is not a defined.`
    },
    isObjectId() {
      return (
        /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i.test(prop) ||
        `${keys} is not a ObjectId.`
      )
    },
    isRequired() {
      return (isDefined(prop) && prop !== '') || `${keys} is required.`
    },

    isString: () => typeof prop === 'string' || `${keys} is not a string.`,
    isBoleand: () => typeof prop === 'boolean' || `${keys} is not a boolean.`,
    isDate: () => Date.parse(prop) > 0 || `${keys} is not a Date.`,
    isEmail: () =>
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(prop) ||
      'It is not a valid email.',
    isPassword: () =>
      // "La contraseña debe tener almenas una mayúscula, numero y mas de 6 caracteres"
      /^((?=.*\d)(?=.*[a-záéóúíñ])(?=.*[A-ZÁÉÓÚÍÑ])?(.*[@#$%!&?¡¿!])?.{6,30})$/.test(
        prop
      ) || 'It is not a valid password',
    some: (items) =>
      items.some((ele) => prop === ele) || `Valid values: ${items}`,
  }
}

function checkErrors(res, errorsList = []) {
  const errors = errorsList.filter((err) => typeof err === 'string')
  if (errors.length > 0) {
    return sendRes(res, 400, null, 'Body validation errors', errors)
  } else {
    return true
  }
}

module.exports = {
  check,
  checkErrors,
}
