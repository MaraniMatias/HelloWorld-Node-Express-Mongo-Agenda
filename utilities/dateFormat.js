// https://date-fns.org/v2.0.1/docs/I18n
const format = require('date-fns/format')

module.exports = (value, formatStr = 'PP') => {
  const date = typeof value === 'string' ? new Date(value) : value
  return format(date, formatStr, { locale: require('date-fns/locale/es') })
}
