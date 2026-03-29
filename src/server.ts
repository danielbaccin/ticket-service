import Fastify from 'fastify'
import { orderRoutes } from './modules/orders/orders.controller'
import { pool } from './db/pool'
import { checkinRoutes } from './modules/checkin/checkin.controller'

const app = Fastify({ logger: true })

// rota raiz (boa prática manter)
app.get('/', async () => {
  return { ok: true }
})

// health com banco
app.get('/health', async () => ({ ok: true }))
app.get('/health/db', async () => {
  const result = await pool.query('SELECT 1')
  return { db: result.rows }
})

// rotas principais
app.register(orderRoutes, { prefix: '/orders' })
app.register(checkinRoutes, { prefix: '/checkin' })

// start
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000

    await app.listen({
      port,
      host: '0.0.0.0'
    })

    console.log(`🚀 rodando em ${port}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()