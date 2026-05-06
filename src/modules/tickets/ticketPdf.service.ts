import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import { pool } from '../../db/pool'

export async function generateTicketPDF(orderId: string) {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 })

      const buffers: Buffer[] = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => resolve(Buffer.concat(buffers)))

      const tickets = await pool.query(`
          SELECT 
            t.code,
            tt.name as type,
            o.buyer_name,
            e.name as event_name,
            e.start_at ,
            e.location
          FROM tickets t
          JOIN orders o ON o.id = t.order_id
          JOIN events e ON e.id = o.event_id
          JOIN ticket_types tt  ON tt.id = t.ticket_type_id
          WHERE t.order_id = $1
        `, [orderId]
      )

      for (let index = 0; index < tickets.rows.length; index++) {
        const ticket = tickets.rows[index]

        if (index > 0) doc.addPage()

        // 🔥 QR
        const qr = await QRCode.toDataURL(ticket.code)
        const base64Data = qr.replace(/^data:image\/png;base64,/, '')
        const imgBuffer = Buffer.from(base64Data, 'base64')

        doc
          .fontSize(22)
          .fillColor('#111')
          .text('KenuiWorks', { align: 'center' })

        doc.moveDown(0.3)

        // 🎟️ Título
        doc
          .fontSize(20)
          .fillColor('#111')
          .text(ticket.event_name, { align: 'center' })

        doc.moveDown(0.5)

        // 📍 Data + local
        const dateFormatted = new Date(ticket.start_at).toLocaleString('pt-BR')

        doc
          .fontSize(12)
          .fillColor('#555')
          .text(`${dateFormatted} • ${ticket.location}`, { align: 'center' })

        doc.moveDown(2)

        // 📦 Box
        doc
          .roundedRect(50, 150, 500, 500, 12)
          .stroke()

        // 👤 Comprador
        doc
          .fontSize(12)
          .fillColor('#333')
          .text(`Nome: ${ticket.buyer_name}`, 70, 180)

        // 🎫 Tipo
        doc
          .fillColor('#111')
          .roundedRect(70, 210, 140, 25, 6)
          .fill()

        doc
          .fillColor('#fff')
          .fontSize(11)
          .text(ticket.type, 80, 217)

        // 🔢 Código
        doc
          .fontSize(10)
          .fillColor('#777')
          .text(`Código: ${ticket.code}`, 70, 240)
        doc
          .moveTo(70, 260)
          .lineTo(480, 260)
          .strokeColor('#ddd')
          .stroke()

        // 🔥 QR centralizado
        const pageWidth = doc.page.width
        const qrWidth = 250
        const x = (pageWidth - qrWidth) / 2

        doc.image(imgBuffer, x, 280, { width: qrWidth })

        // 📌 Rodapé
        doc
          .fontSize(10)
          .fillColor('#777')
          .text(
            'Apresente este QR Code na entrada do evento',
            50,
            600,
            { align: 'center' }
          )
      }
      doc.end()
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      reject(error)
    }
  })
}