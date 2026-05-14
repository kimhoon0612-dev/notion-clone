const { Server } = require('@hocuspocus/server')

const port = parseInt(process.env.PORT || '1234', 10)

const server = Server.configure({
  port,
  address: '0.0.0.0',
  async onAuthenticate() {
    return {
      user: {
        name: "Anonymous"
      }
    }
  },
})

server.listen()
console.log(`Hocuspocus Collab Server running on port ${port}`)
