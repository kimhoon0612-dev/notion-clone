const { Server } = require('@hocuspocus/server')

const server = Server.configure({
  port: 1234,
  async onAuthenticate() {
    return {
      user: {
        name: "Anonymous"
      }
    }
  },
})

server.listen()
console.log("Hocuspocus Collab Server running on ws://localhost:1234")
