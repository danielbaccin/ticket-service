import { pool } from '../../db/pool'
import { randomUUID } from 'crypto'
import { generateQRCode } from '../../shared/qr.service'


export async function createOrder(data: any) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const orderId = randomUUID()

    await client.query(
      `INSERT INTO orders (id, event_id, buyer_name, buyer_email, status)
       VALUES ($1, $2, $3, $4, 'PENDING')`,
      [orderId, data.event_id, data.buyer_name, data.buyer_email]
    )

    const tickets = []

    for (const t of data.tickets) {
      const ticketId = randomUUID()
      const code = randomUUID().slice(0, 8)

      await client.query(
        `INSERT INTO tickets (id, event_id, order_id, ticket_type_id, code, holder_name, holder_email, holder_phone, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')`,
        [
          ticketId,
          data.event_id,
          orderId,
          t.ticket_type_id,
          code,
          t.holder_name,
          t.holder_email,
          t.holder_phone
        ]
      )

      // // fila de envio
      // await client.query(
      //   `INSERT INTO delivery_queue (id, ticket_id, channel, status)
      //    VALUES ($1, $2, 'EMAIL', 'PENDING')`,
      //   [randomUUID(), ticketId]
      // )

      const qr = await generateQRCode(code)

      tickets.push({
        ticketId,
        code,
        qr
      })

    }

    await client.query('COMMIT')

    return {
      orderId,
      tickets
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}