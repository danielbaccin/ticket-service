import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { createOrder } from './orders.service'
import { createOrderSchema } from './orders.schema'
import { pool } from '../../db/pool'

export async function orderRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const body = createOrderSchema.parse(request.body)

    const result = await createOrder(body)

    return reply.send(result)
  })
}
export async function getOrderById(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string }

  const result = await pool.query(
    'SELECT id, status, qr_code FROM orders WHERE id = $1',
    [id]
  )

  const order = result.rows[0]

  if (!order) {
    return reply.status(404).send({ error: 'Order not found' })
  }

  return reply.send(order)
}