import { FastifyInstance } from 'fastify'
import { getTicketTypes } from './ticket-types.service'

export async function ticketTypesRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    try {
      const types = await getTicketTypes()
      return reply.send(types)
    } catch (err) {
      console.error(err)
      return reply.status(500).send({ error: 'Erro ao buscar tipos' })
    }
  })
}