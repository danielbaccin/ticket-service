import Fastify from 'fastify'

const app = Fastify({ logger: true })

app.get('/', async () => {
  return { ok: true }
})

const start = async () => {
  const port = Number(process.env.PORT) || 3000

  await app.listen({
    port,
    host: '0.0.0.0'
  })

  console.log('🚀 rodando')
}

start()