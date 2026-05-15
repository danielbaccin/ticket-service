import { pool } from '../../db/pool'

export async function findEventById(eventId: string) {
  const eventResult = await pool.query(
    `
    SELECT
      id,
      name,
      description,
      banner_url,
      location,
      start_at
    FROM events
    WHERE id = $1
    `,
    [eventId]
  )

  const event = eventResult.rows[0]

  if (!event) {
    return null
  }

  const ticketTypesResult = await pool.query(
    `
    SELECT
      id,
      name,
      price,
      total_quantity
    FROM ticket_types
    WHERE event_id = $1
    ORDER BY price ASC
    `,
    [eventId]
  )

  return {
    ...event,
    ticketTypes: ticketTypesResult.rows
  }
}