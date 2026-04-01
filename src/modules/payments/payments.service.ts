import { pool } from '../../db/pool'
import { MercadoPagoConfig, Preference } from 'mercadopago'

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

  const preference = new Preference(client)

  console.log('TOKEN:', process.env.MP_ACCESS_TOKEN)
  console.log('EMAIL:', order.buyer_email)
  console.log('API_URL:', process.env.API_URL)

  const response = await preference.create({
    body: {
      items: [
        {
          title: 'Ingresso evento',
          quantity: 1,
          unit_price: amount
        }
      ],
      payer: {
        email: order.buyer_email
      },
      notification_url: `${process.env.API_URL}/api/webhooks/mercadopago`,
      external_reference: orderId
    } as any
  })

  const data = response

  // salva no banco (ajustado)
  await pool.query(
    `INSERT INTO payments (order_id, status, external_id)
     VALUES ($1, $2, $3)`,
    [
      orderId,
      'pending',
      data.id // id da preference
    ]
  )

  return {
    checkout_url: data.init_point
  }
}