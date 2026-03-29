import Fastify from 'fastify'

const app = Fastify({ logger: true })

app.get('/', async () => {
  return { ok: true }
})

app.get('/health', async () => {
  return { ok: true }
})

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000

    await app.listen({
      port,
      host: '0.0.0.0'
    })

    console.log(`🚀 Server rodando na porta ${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()