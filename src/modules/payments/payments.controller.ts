import { FastifyInstance } from 'fastify'
import { createPixPayment } from './payments.service'

export async function paymentsRoutes(app: FastifyInstance) {
  app.post('/pix', async (request, reply) => {
    try {
      const { orderId } = request.body as any

      if (!orderId) {
        return reply.status(400).send({ error: 'orderId obrigatório' })
      }

      const result = await createPixPayment(orderId)

      return reply.send(result)

    } catch (err) {
      console.error(err)
      return reply.status(500).send({ error: 'Erro ao gerar Pix' })
    }
  })
}