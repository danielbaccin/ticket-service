import { FastifyInstance } from 'fastify'
import { checkin } from './checkin.service'

export async function checkinRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const { code } = request.body as any

    const result = await checkin(code)

    return reply.send(result)
  })
}