import { FastifyInstance } from 'fastify'
import { dashboardController } from './dashboard.controller'

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/dashboard/:eventId', dashboardController)
}