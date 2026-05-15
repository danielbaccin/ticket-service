import { FastifyInstance } from 'fastify'
import { getEventById } from './events.controller'

export async function eventsRoutes(app: FastifyInstance) {
  app.get('/:eventId', getEventById)
}