import { FastifyReply, FastifyRequest } from 'fastify'
import { getDashboardData } from './dashboard.service'

export async function dashboardController(
  request: FastifyRequest<{
    Params: {
      eventId: string
    }
  }>,
  reply: FastifyReply
) {
  try {
    const { eventId } = request.params

    if (!eventId) {
      return reply.status(400).send({
        error: 'eventId é obrigatório'
      })
    }

    const dashboard = await getDashboardData(eventId)

    return reply.send(dashboard)
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error)

    return reply.status(500).send({
      error: 'Erro interno ao buscar dashboard'
    })
  }
}