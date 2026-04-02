import { pool } from '../../db/pool'
import axios from 'axios'

export async function handleMercadoPagoWebhook(body: any) {
  // Mercado Pago manda vários tipos de evento
  if (body.type !== 'payment') {
    console.log('Evento ignorado:', body.type)
    return
  }

  const paymentId = body.data?.id

  if (!paymentId) {
    console.log('Sem payment_id')
    return
  }

  console.log('Consultando pagamento:', paymentId)

  // consulta o pagamento na API
  const response = await axios.get(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
      }
    }
  )

  const payment = response.data

  console.log('Status pagamento:', payment.status)

  const orderId = payment.external_reference

  if (!orderId) {
    console.log('Sem external_reference')
    return
  }

  // atualiza pagamento no banco
  await pool.query(
    `UPDATE payments
     SET status = $1
     WHERE order_id = $2`,
    [payment.status, orderId]
  )

  // 🔥 se aprovado → libera ingresso
  if (payment.status === 'approved') {
    await pool.query(
      `UPDATE orders
       SET status = 'paid'
       WHERE id = $1`,
      [orderId]
    )

    console.log('✅ Pedido pago:', orderId)
  }
}