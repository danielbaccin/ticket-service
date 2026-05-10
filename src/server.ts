import Fastify from 'fastify'
import { orderRoutes } from './modules/orders/orders.controller'
import { pool } from './db/pool'
import { checkinRoutes } from './modules/checkin/checkin.controller'
import fastifyStatic from '@fastify/static'
import path from 'path'
import { ticketTypesRoutes } from './modules/ticket-types/ticket-types.controller'
import { paymentsRoutes } from './modules/payments/payments.controller'
import { mercadopagoWebhook } from './modules/webhooks/webhooks.controller'
import { getOrderById } from './modules/orders/orders.controller'
import { dashboardRoutes } from './modules/admin/dashboard.routes'
import cors from '@fastify/cors'

const app = Fastify({ logger: true })

// start
const start = async () => {
  try {
    await app.register(cors, {
      origin: true
    })

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
    app.register(orderRoutes, { prefix: '/api/orders' })
    app.register(checkinRoutes, { prefix: '/api/checkin' })
    app.register(fastifyStatic, {
      root: path.join(__dirname, '../public'),
    })
    app.register(ticketTypesRoutes, { prefix: '/api/ticket-types' })
    app.register(paymentsRoutes, { prefix: '/api/payments' })
    app.post('/api/webhooks/mercadopago', mercadopagoWebhook)
    app.get('/api/orders/:id', getOrderById)
    app.register(dashboardRoutes, {
      prefix: '/api/admin'
    })


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