import { FastifyInstance } from 'fastify'
import { checkin } from './checkin.service'
import { getTicketByCode } from './checkin.service'

export async function checkinRoutes(app: FastifyInstance) {

  // 🔍 preview
  app.get('/:code', async (request, reply) => {
    const { code } = request.params as any

    const ticket = await getTicketByCode(code)

    if (!ticket) {
      return { valid: false, message: 'Não encontrado' }
    }

    if (ticket.status === 'USED') {
      return { valid: false, message: 'Já utilizado' }
    }

    return {
      valid: true,
      name: ticket.holder_name,
      type: ticket.type
    }
  })

  // 🔒 confirmação
  app.post('/confirm', async (request, reply) => {
    if (request.headers.authorization !== 'Bearer 123') {
      return reply.status(401).send()
    }
    const { code } = request.body as any

    const result = await checkin(code)

    return result
  })

}