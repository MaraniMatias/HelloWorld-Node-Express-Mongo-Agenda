const sendEmailTo = require('../emails/send')

module.exports.jobCreate = (agenda, data) =>
  agenda.create(this.name, data).save()

// Export params to define a job
module.exports.name = 'SEND_EMAIL_VERIFY_EMAIL'
module.exports.options = {}

// Export job or task
module.exports.job = async (job) => {
  await sendEmailTo(
    { subject: 'Bienvenido', template: 'new_user.pug' },
    job.attrs.data
  )
}
