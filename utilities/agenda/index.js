const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const Agenda = require('agenda')

const autoStartJobs = []

module.exports.Agenda = new Agenda({ mongo: mongoose.connection })

module.exports.start = async function () {
  try {
    const agenda = this.Agenda

    // Auto load task
    fs.readdirSync(__dirname)
      .filter((fileName) => /^.+\.job\.js$/.test(fileName))
      .map((fileName) => {
        const fileDir = path.join(__dirname, fileName)
        const { name, job, options, autoStart, jobCreate } = require(fileDir)
        if (autoStart) autoStartJobs.push(jobCreate)
        const agendaOptions = options || { priority: 'normal', concurrency: 2 }
        agenda.define(name, agendaOptions, job)
        console.log('Load Agenda job', name)
      })

    await this.Agenda.start()
    autoStartJobs.forEach((jobCreate) => jobCreate(this.Agenda))
    // await this.Agenda.purge() // delete old agenda job
  } catch (e) {
    console.error('Error al cargar agenda')
  }
}
