import { FastifyReply, FastifyRequest } from 'fastify'
import { getAdminOrderById, listOrders } from './orders.service'

export async function listOrdersController(
  request: FastifyRequest<{ Querystring: { status?: string } }>,
  reply: FastifyReply
) {
  try {
    const orders = await listOrders(request.query.status)
    return reply.send({ orders })
  } catch (error) {
    return reply.status(400).send({
      error: error instanceof Error ? error.message : 'Não foi possível listar os pedidos',
    })
  }
}

export async function getAdminOrderController(
  request: FastifyRequest<{ Params: { orderId: string } }>,
  reply: FastifyReply
) {
  const order = await getAdminOrderById(request.params.orderId)

  if (!order) {
    return reply.status(404).send({ error: 'Pedido não encontrado' })
  }

  return reply.send(order)
}
