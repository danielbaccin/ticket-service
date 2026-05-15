import { FastifyReply, FastifyRequest } from 'fastify'
import { findEventById } from './events.service'

export async function getEventById(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { eventId } = request.params as {
    eventId: string
  }

  const event = await findEventById(eventId)

  if (!event) {
    return reply.status(404).send({
      error: 'Event not found'
    })
  }

  return reply.send(event)
}