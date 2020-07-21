require('dotenv-flow').config({ purge_dotenv: true, silent: true })

const PORT = process.env.PORT || 3000
const cluster = require('cluster')
const numCPUs = require('os').cpus().length

const mongoose = require('mongoose')

mongoose.Promise = global.Promise
const getMongoURL = require('./utilities/getMongoURL')
const getLocalIP = require('./utilities/getLocalIP')
const Agenda = require('./utilities/agenda')
const app = require('./server')

function startServer() {
  const mongoURL = getMongoURL()
  console.log('MongoDB URL', mongoURL)
  const mongooseOptions = {
    useNewUrlParser: true,
    // useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  }
  mongoose.connect(mongoURL, mongooseOptions, (err) => {
    if (err) {
      console.error(`Error al conectar a la base de datos: ${err}`)
      process.exit()
    } else {
      app.listen(PORT, '0.0.0.0', () => {
        if (!cluster.isMaster) {
          console.info(
            `Express server running as Worker ${cluster.worker.id} running @ process ${cluster.worker.process.pid}`
          )
        }
        Agenda.start()
        getLocalIP()
      })
    }
  })
}

if (process.env.NODE_ENV === 'development') {
  startServer()
} else if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`)

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker) => {
    console.log(`worker ${worker.process.pid} died`)
    cluster.fork() // Create a New Worker, If Worker is Dead
  })
} else {
  console.log(`This process is pid ${process.pid}`)
  console.log(`The parent process is pid ${process.ppid}`)
  startServer()
}

// Error
process.on('uncaughtException', function (err) {
  console.info(`This process is pid ${process.pid}`)
  console.info(`The parent process is pid ${process.ppid}`)
  console.error('Exception', err.stack)
})
