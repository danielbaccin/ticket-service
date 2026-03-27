import { pool } from '../db/pool'

async function run() {
  while (true) {
    const res = await pool.query(
      `SELECT * FROM delivery_queue
       WHERE status = 'PENDING'
       LIMIT 5`
    )

    for (const job of res.rows) {
      try {
        console.log('📧 Enviando email ticket:', job.ticket_id)

        // simulação de envio
        await new Promise(r => setTimeout(r, 1000))

        await pool.query(
          `UPDATE delivery_queue
           SET status = 'DONE'
           WHERE id = $1`,
          [job.id]
        )
      } catch (err) {
        await pool.query(
          `UPDATE delivery_queue
           SET attempts = attempts + 1
           WHERE id = $1`,
          [job.id]
        )
      }
    }

    await new Promise(r => setTimeout(r, 2000))
  }
}

run()