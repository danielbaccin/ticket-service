import { FastifyInstance } from 'fastify'
import { dashboardController } from './dashboard.controller'
import { getAdminOrderController, listOrdersController } from './orders.controller'

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/dashboard/:eventId', dashboardController)
  app.get('/orders', listOrdersController)
  app.get('/orders/:orderId', getAdminOrderController)
}
