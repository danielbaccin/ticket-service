import { pool } from '../../db/pool'
import { randomUUID } from 'crypto'

export async function checkin(code: string) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1. buscar ticket
    const ticketRes = await client.query(
      `SELECT * FROM tickets WHERE code = $1`,
      [code]
    )

    if (ticketRes.rows.length === 0) {
      throw new Error('Ticket não encontrado')
    }

    const ticket = ticketRes.rows[0]

    // 2. verificar status
    if (ticket.status === 'USED') {
      throw new Error('Ticket já utilizado')
    }

    if (ticket.status !== 'VALID') {
      throw new Error('Ticket inválido')
    }

    // 3. registrar check-in
    await client.query(
      `INSERT INTO checkins (id, ticket_id)
       VALUES ($1, $2)`,
      [randomUUID(), ticket.id]
    )

    // 4. atualizar ticket
    await client.query(
      `UPDATE tickets SET status = 'USED' WHERE id = $1`,
      [ticket.id]
    )

    await client.query('COMMIT')

    return {
      success: true,
      message: 'Check-in realizado com sucesso'
    }

  } catch (err: any) {
    await client.query('ROLLBACK')

    return {
      success: false,
      message: err.message
    }
  } finally {
    client.release()
  }
}

export async function getTicketByCode(code: string) {
  const result = await pool.query(
    `SELECT t.*, tt.name as type
     FROM tickets t
     JOIN ticket_types tt ON tt.id = t.ticket_type_id
     WHERE t.code = $1`,
    [code]
  )

  return result.rows[0]
}