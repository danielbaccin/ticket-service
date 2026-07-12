import { FastifyInstance } from 'fastify'
import { checkin } from './checkin.service'
import { getTicketByCode } from './checkin.service'

async function previewTicket(code: string) {
  const ticket = await getTicketByCode(code)

  if (!ticket) {
    return { valid: false, message: 'Não encontrado' }
  }

  if (ticket.status === 'USED') {
    return { valid: false, message: 'Já utilizado' }
  }

  if (ticket.status !== 'VALID') {
    return { valid: false, message: 'Ingresso inválido' }
  }

  return { valid: true, name: ticket.holder_name, type: ticket.type }
}

export async function checkinRoutes(app: FastifyInstance) {

  // 🔍 preview - explicit route used by the frontend scanner
  app.get('/ticket/:code', async (request, reply) => {
    const { code } = request.params as any
    return previewTicket(code)
  })

  // Kept for the former static check-in page and existing integrations.
  app.get('/:code', async (request, reply) => {
    const { code } = request.params as any
    return previewTicket(code)
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
