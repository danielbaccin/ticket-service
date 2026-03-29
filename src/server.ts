import Fastify from 'fastify'

const app = Fastify({ logger: true })

app.get('/', async () => {
  return { ok: true }
})

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000

    await app.listen({
      port: 3000,
      host: '0.0.0.0'
    })

    console.log(`🚀 rodando em 0.0.0.0:${port}`)
    console.log('ENV PORT:', process.env.PORT)
    console.log('PORT   :', process.env.PORT)

  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()