const path = require('path')
const pug = require('pug')
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')

const options = (function () {
  const _o = {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_AUTH_USER,
      pass: process.env.EMAIL_AUTH_PASS,
    },
    email_no_replay:
      process.env.EMAIL_NOMBRE + ' <' + process.env.EMAIL_AUTH_USER + '>',
    logo: process.env.EMAIL_LOGO,
  }

  if (/gmail/.test(process.env.EMAIL_HOST)) {
    _o.service = 'gmail' // only smtp and google account
    return smtpTransport(_o)
  } else {
    return _o
  }
})()

if (process.env.NODE_ENV !== 'production') console.log(options)

const getHtmlEmail = (file, obj = {}) => {
  return pug.compileFile(path.join(__dirname, 'templates', file))({
    ...obj,
    logo: options.logo,
  })
}

module.exports = async function ({ subject, template }, data) {
  const sendEmailTo = data.email || data.sendEmailTo
  if (process.env.NODE_ENV !== 'production') {
    console.log("sendMail '" + subject + "' to", sendEmailTo)
  }
  // Generate test SMTP service account from ethereal.email
  // await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport(options)

  if (process.env.NODE_ENV !== 'production') {
    // create reusable transporter object using the default SMTP transport
    transporter.verify(function (error) {
      if (error) console.log(error)
      else console.log('Server is ready to take our messages')
    })
  }

  await transporter.sendMail({
    from: options.email_no_replay,
    to: process.env.EMAIL_DEFAULT || sendEmailTo,
    bcc:
      process.env.NODE_ENV === 'production' &&
      process.env.EMAIL_AUTH_USER !== sendEmailTo
        ? process.env.EMAIL_AUTH_USER
        : undefined,
    subject: subject + ' - ' + process.env.EMAIL_NOMBRE,
    html: getHtmlEmail(template, { data, subject }),
  })
}
