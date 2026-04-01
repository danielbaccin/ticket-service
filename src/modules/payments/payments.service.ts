import { pool } from '../../db/pool'
import { MercadoPagoConfig, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!
})

export async function createPixPayment(orderId: string) {
  const orderRes = await pool.query(
    `SELECT * FROM orders WHERE id = $1`,
    [orderId]
  )

  const order = orderRes.rows[0]

  if (!order) {
    throw new Error('Order não encontrada')
  }

  const amount = 50 // depois vamos calcular dinâmico

  const payment = new Payment(client)

  console.log('TOKEN:', process.env.MP_ACCESS_TOKEN)
  console.log('EMAIL:', order.buyer_email)
  console.log('API_URL:', process.env.API_URL)

  const response = await payment.create({
    body: {
      transaction_amount: amount,
      description: 'Ingresso evento',
      payment_method_id: 'pix',
      payer: {
        email: order.buyer_email
      },
      notification_url: `${process.env.API_URL}/api/webhooks/mercadopago`
    }
  })

  const data = response

  // salva no banco
  await pool.query(
    `INSERT INTO payments (id, order_id, status, external_id)
     VALUES ($1, $2, $3, $4)`,
    [
      data.id,
      orderId,
      data.status,
      data.id
    ]
  )

  return {
    qr_code: data.point_of_interaction?.transaction_data?.qr_code,
    qr_code_base64:
      data.point_of_interaction?.transaction_data?.qr_code_base64
  }
}