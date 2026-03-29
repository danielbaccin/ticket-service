import Fastify from 'fastify'
import { orderRoutes } from './modules/orders/orders.controller'
import { pool } from './db/pool'

const app = Fastify({ logger: true })

app.register(orderRoutes, { prefix: '/orders' })

app.get('/health', async () => {
  const result = await pool.query('SELECT 1')
  return { ok: true, db: result.rows }
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