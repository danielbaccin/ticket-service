import { FastifyRequest, FastifyReply } from 'fastify'
import { handleMercadoPagoWebhook } from './webhooks.service'

export async function mercadopagoWebhook(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    console.log('Webhook recebido:', request.body)

    await handleMercadoPagoWebhook(request.body)

  } catch (error) {
    console.error('Erro no webhook:', error)
  }

  // 🔥 SEMPRE responde 200
  reply.status(200).send()
}