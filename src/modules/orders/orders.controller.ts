import { FastifyInstance } from 'fastify'
import { createOrder } from './orders.service'
import { createOrderSchema } from './orders.schema'

export async function orderRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const body = createOrderSchema.parse(request.body)

    const result = await createOrder(body)

    return reply.send(result)
  })
}