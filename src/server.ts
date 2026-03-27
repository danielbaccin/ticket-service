import Fastify from 'fastify'
import { orderRoutes } from './modules/orders/orders.controller'

const app = Fastify({ logger: true })

app.register(orderRoutes, { prefix: '/orders' })

app.listen({ port: 3000 }).then(() => {
  console.log('🚀 Server rodando na porta 3000')
})