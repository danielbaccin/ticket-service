import { pool } from '../../db/pool'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!
})

export async function createPixPayment(orderId: string) {
  
  console.log('Criando pagamento para orderId:', orderId)

  const orderRes = await pool.query(
    `SELECT * FROM orders WHERE id = $1`,
    [orderId]
  )

  const order = orderRes.rows[0]

  if (!order) {
    throw new Error('Order não encontrada')
  }

  console.log('Order encontrada:', order)

  const totalRes = await pool.query(`
    SELECT SUM(tt.price) as total
    FROM tickets t
    JOIN ticket_types tt ON tt.id = t.ticket_type_id
    WHERE t.order_id = $1
  `, [orderId])

  const amount = parseFloat(totalRes.rows[0].total || 0)

  if (amount <= 0) {
    throw new Error('Valor do pedido inválido')
  }

  console.log('Valor total calculado:', amount)

  const preference = new Preference(client)

  console.log('TOKEN:', process.env.MP_ACCESS_TOKEN)
  console.log('EMAIL:', order.buyer_email)
  console.log('API_URL:', process.env.API_URL)

  console.log('Criando preferência de pagamento no Mercado Pago...')

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
        email: order.buyer_email,
        name: order.buyer_name,
        surname: 'Daniel Baccin'
      },
      notification_url: `${process.env.API_URL}/api/webhooks/mercadopago`,
      external_reference: orderId
    } as any
  })

  const data = response

  console.log('Preferência criada:', data)

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
  console.log('Pagamento salvo no banco com status pending')

  return {
    id: data.id,
    init_point: data.init_point,
    checkout_url: data.init_point
  }
}