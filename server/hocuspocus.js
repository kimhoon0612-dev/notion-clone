const { Server } = require('@hocuspocus/server')

const port = parseInt(process.env.PORT || '1234', 10)

try {
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

  server.listen().then(() => {
    console.log(`Hocuspocus Collab Server running on port ${port}`)
  }).catch((err) => {
    console.error('Failed to start server:', err)
    process.exit(1)
  })
} catch (err) {
  console.error('Server configuration error:', err)
  process.exit(1)
}
