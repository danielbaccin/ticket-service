import Fastify from 'fastify'
import { orderRoutes } from './modules/orders/orders.controller'
import { pool } from './db/pool'

const app = Fastify({ logger: true })

// rotas
app.register(orderRoutes, { prefix: '/orders' })

app.get('/health', async () => {
  const result = await pool.query('SELECT 1')
  return { ok: true, db: result.rows }
})

// subir servidor (SEMPRE por último)
const port = Number(process.env.PORT) || 3000

app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`🚀 Server rodando na porta ${port}`)
}) 