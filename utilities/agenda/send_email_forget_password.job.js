const sendEmailTo = require('../emails/send')

module.exports.jobCreate = (agenda, data) =>
  agenda.create(this.name, data).save()

// Export params to define a job
module.exports.name = 'SEND_EMAIL_FORGET_PASSWORD'
module.exports.options = {}

// Export job or task
module.exports.job = async (job) => {
  await sendEmailTo(
    { subject: 'Cambiar contraseña', template: 'new_forget_password.pug' },
    job.attrs.data
  )
}
