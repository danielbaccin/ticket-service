import Fastify from 'fastify'
import { orderRoutes } from './modules/orders/orders.controller'
import { pool } from './db/pool'

const app = Fastify({ logger: true })

// rota raiz (boa prática manter)
app.get('/', async () => {
  return { ok: true }
})

// health com banco
app.get('/health', async () => {
  const result = await pool.query('SELECT 1')
  return { ok: true, db: result.rows }
})

// rotas principais
app.register(orderRoutes, { prefix: '/orders' })

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