const StaticServer = require('static-server')
const path = require('path')

const server = new StaticServer({
  rootPath: path.join(__dirname, '../assets/'),
  port: 1337,
  cors: '*',
})

server.start(() => {
  console.log('Server listening to', server.port)
})
