import { pool } from '../../db/pool'

export async function getTicketTypes() {
  const result = await pool.query(
    `SELECT id, name, price, total_quantity FROM ticket_types ORDER BY name`
  )

  return result.rows
}