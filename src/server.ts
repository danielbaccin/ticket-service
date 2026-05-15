import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import path from 'path'

import { pool } from './db/pool'

import { orderRoutes, getOrderById } from './modules/orders/orders.controller'
import { checkinRoutes } from './modules/checkin/checkin.controller'
import { ticketTypesRoutes } from './modules/ticket-types/ticket-types.controller'
import { paymentsRoutes } from './modules/payments/payments.controller'
import { mercadopagoWebhook } from './modules/webhooks/webhooks.controller'
import { dashboardRoutes } from './modules/admin/dashboard.routes'
import { eventsRoutes } from './modules/events/events.routes'

const app = Fastify({
  logger: {
    level: 'info'
  }
})

app.setErrorHandler((error, request, reply) => {
  console.error(error)

  reply.status(500).send({
    error: 'Internal Server Error'
  })
})

const start = async () => {
  try {
    await app.register(cors, {
      origin: true
    })

    app.get('/', async () => {
      return { ok: true }
    })

    app.get('/health', async () => ({
      ok: true
    }))

    app.get('/health/db', async () => {
      const result = await pool.query('SELECT 1')

      return {
        db: result.rows
      }
    })

    app.register(orderRoutes, {
      prefix: '/api/orders'
    })

    app.get('/api/orders/:id', getOrderById)

    app.register(checkinRoutes, {
      prefix: '/api/checkin'
    })

    app.register(ticketTypesRoutes, {
      prefix: '/api/ticket-types'
    })

    app.register(paymentsRoutes, {
      prefix: '/api/payments'
    })

    app.register(dashboardRoutes, {
      prefix: '/api/admin'
    })

    app.post(
      '/api/webhooks/mercadopago',
      mercadopagoWebhook
    )

    app.register(fastifyStatic, {
      root: path.join(__dirname, '../public')
    })

    app.register(eventsRoutes, {
      prefix: '/api/events'
    })

    console.log(app.printRoutes())

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