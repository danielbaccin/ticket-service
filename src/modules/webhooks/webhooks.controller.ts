import { Request, Response } from 'express'
import { handleMercadoPagoWebhook } from './webhooks.service'

export async function mercadopagoWebhook(req: Request, res: Response) {
  try {
    console.log('Webhook recebido:', req.body)

    await handleMercadoPagoWebhook(req.body)

    res.sendStatus(200)
  } catch (error) {
    console.error('Erro no webhook:', error)
    res.sendStatus(500)
  }
}