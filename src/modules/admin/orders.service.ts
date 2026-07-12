import { pool } from '../../db/pool'

const allowedStatuses = new Set(['PENDING', 'PAID', 'CANCELED'])

export async function listOrders(status?: string) {
  const filters: string[] = []
  const values: string[] = []

  if (status && status !== 'ALL') {
    if (!allowedStatuses.has(status)) {
      throw new Error('Status de pedido inválido')
    }

    values.push(status)
    filters.push(`o.status = $${values.length}`)
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

  const result = await pool.query(
    `SELECT
       o.id,
       o.buyer_name,
       o.status,
       o.created_at,
       COALESCE(SUM(tt.price), 0) AS amount
     FROM orders o
     LEFT JOIN tickets t ON t.order_id = o.id
     LEFT JOIN ticket_types tt ON tt.id = t.ticket_type_id
     ${where}
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    values
  )

  return result.rows.map((order) => ({
    ...order,
    amount: Number(order.amount),
  }))
}

export async function getAdminOrderById(orderId: string) {
  const orderResult = await pool.query(
    `SELECT
       o.id,
       o.status,
       o.created_at,
       o.buyer_name,
       o.buyer_email,
       (
         SELECT holder_phone
         FROM tickets
         WHERE order_id = o.id
         ORDER BY id
         LIMIT 1
       ) AS buyer_phone,
       COALESCE((
         SELECT SUM(tt.price)
         FROM tickets t
         JOIN ticket_types tt ON tt.id = t.ticket_type_id
         WHERE t.order_id = o.id
       ), 0) AS amount,
       p.external_id AS payment_id,
       p.status AS payment_status,
       p.created_at AS payment_created_at,
       p.updated_at AS payment_updated_at
     FROM orders o
     LEFT JOIN LATERAL (
       SELECT external_id, status, created_at, updated_at
       FROM payments
       WHERE order_id = o.id
       ORDER BY created_at DESC
       LIMIT 1
     ) p ON true
     WHERE o.id = $1`,
    [orderId]
  )

  const order = orderResult.rows[0]
  if (!order) return null

  const ticketsResult = await pool.query(
    `SELECT
       t.id,
       tt.name,
       t.code
     FROM tickets t
     JOIN ticket_types tt ON tt.id = t.ticket_type_id
     WHERE t.order_id = $1
     ORDER BY t.id`,
    [orderId]
  )

  return {
    id: order.id,
    status: order.status,
    amount: Number(order.amount),
    created_at: order.created_at,
    buyer_name: order.buyer_name,
    buyer_email: order.buyer_email,
    buyer_phone: order.buyer_phone,
    tickets: ticketsResult.rows,
    payment: order.payment_id
      ? {
          id: order.payment_id,
          status: order.payment_status,
          amount: Number(order.amount),
          method: 'PIX',
          approved_at:
            order.payment_status === 'approved' ? order.payment_updated_at : null,
        }
      : null,
  }
}
