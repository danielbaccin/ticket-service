import { pool } from '../../db/pool'
import mercadopago from 'mercadopago'

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN!
})

export async function createPixPayment(orderId: string) {
  // 🔍 busca order
  const orderRes = await pool.query(
    `SELECT * FROM orders WHERE id = $1`,
    [orderId]
  )

  const order = orderRes.rows[0]

  if (!order) {
    throw new Error('Order não encontrada')
  }

  // 💰 valor (ajusta depois pra somar tickets)
  const amount = 50 // 👈 TEMPORÁRIO

  const paymentData = {
    transaction_amount: amount,
    description: `Ingresso evento`,
    payment_method_id: 'pix',
    payer: {
      email: order.buyer_email
    },
    notification_url: `${process.env.API_URL}/api/webhooks/mercadopago`
  }

  const response = await mercadopago.payment.create(paymentData as any)

  const payment = response.body

  // 💾 salva pagamento no banco
  await pool.query(
    `INSERT INTO payments (id, order_id, status, external_id)
     VALUES ($1, $2, $3, $4)`,
    [
      payment.id,
      orderId,
      payment.status,
      payment.id
    ]
  )

  return {
    qr_code: payment.point_of_interaction.transaction_data.qr_code,
    qr_code_base64:
      payment.point_of_interaction.transaction_data.qr_code_base64
  }
}