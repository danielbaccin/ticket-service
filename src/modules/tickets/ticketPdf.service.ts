import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'

export async function generateTicketPDF(orderId: string) {
  return new Promise<Buffer>(async (resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })

    const buffers: Buffer[] = []
    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => resolve(Buffer.concat(buffers)))

    // 🎨 HEADER
    doc
      .fontSize(22)
      .fillColor('#111')
      .text('🎟️ KenuiWorks', { align: 'center' })

    doc.moveDown(0.5)

    doc
      .fontSize(16)
      .fillColor('#555')
      .text('Ingresso do Evento', { align: 'center' })

    doc.moveDown(2)

    // 📦 BOX DO INGRESSO
    doc
      .roundedRect(50, 150, 500, 400, 10)
      .stroke()

    // 📄 Info
    doc
      .fontSize(12)
      .fillColor('#333')
      .text(`Pedido: ${orderId}`, 70, 180)

    doc.moveDown()

    doc.text('Entrada válida para 1 pessoa', 70, 210)

    // 🔥 QR Code
    const qr = await QRCode.toDataURL(
      `${process.env.API_URL}/api/checkin/${orderId}`
    )

    const base64Data = qr.replace(/^data:image\/png;base64,/, '')
    const imgBuffer = Buffer.from(base64Data, 'base64')

    doc.image(imgBuffer, 200, 260, { width: 200 })

    // 📌 Rodapé
    doc
      .fontSize(10)
      .fillColor('#777')
      .text(
        'Apresente este QR Code na entrada do evento',
        50,
        500,
        { align: 'center' }
      )

    doc.end()
  })
}