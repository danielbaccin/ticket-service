import { pool } from '../../db/pool'
import axios from 'axios'
import { generateTicketQRCode } from '../tickets/ticket.service'
import { sendTicketEmail } from '../notifications/email.service'

export async function handleMercadoPagoWebhook(body: any) {
  try {
    // 1. só processa pagamento
   if (!body.type) {
      console.log('⚠️ Webhook sem tipo:', body)
      return
    }

    if (body.type !== 'payment') {
      console.log('Evento ignorado:', body.type)
      return
    }

    const paymentId = body.data?.id
    if (!paymentId) return

    console.log('🔎 Consultando pagamento:', paymentId)

    // 2. consulta pagamento real
    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      }
    )

    const payment = response.data

    const status = payment.status
    const orderId = payment.external_reference

    console.log('📦 Order:', orderId)
    console.log('💰 Status:', status)

    if (!orderId) {
      console.log('⚠️ Sem external_reference')
      return
    }

    // 3. evita duplicidade (idempotência)
    const existing = await pool.query(
      `SELECT status FROM payments WHERE order_id = $1`,
      [orderId]
    )

    if (existing.rows.length > 0) {
      const currentStatus = existing.rows[0].status

      // se já está aprovado, não faz nada
      if (currentStatus === 'approved') {
        console.log('⚠️ Já aprovado, ignorando duplicado')
        return
      }
    }

    // 4. atualiza pagamento
    await pool.query(
      `UPDATE payments
       SET status = $1, external_id = $2, updated_at = NOW()
       WHERE order_id = $3`,
      [status, payment.id, orderId]
    )

    // 5. se aprovado → libera pedido
    if (status === 'approved') {
      const qrCode = await generateTicketQRCode(orderId)

      await pool.query(
        `UPDATE orders
        SET status = 'PAID', qr_code = $1, updated_at = NOW()
        WHERE id = $2`,
        [qrCode, orderId]
      )

      console.log('✅ Pedido pago:', orderId)


      const orderRes = await pool.query(
        'SELECT buyer_email FROM orders WHERE id = $1',
        [orderId]
      )

      const email = orderRes.rows[0]?.buyer_email

      if (!email) {
        console.log('⚠️ Email não encontrado no pedido')
        return
      }

      await sendTicketEmail(email, qrCode)

      console.log('📩 Email enviado:', email)
    }

  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log('⚠️ Payment não encontrado (simulador)')
      return
    }

    console.error('❌ Erro webhook:', error.message)
    throw error
  }
}