import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'

export async function generateTicketPDF(orderId: string) {
  return new Promise<Buffer>(async (resolve) => {
    const doc = new PDFDocument()

    const buffers: Buffer[] = []

    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => resolve(Buffer.concat(buffers)))

    // 🎟️ Título
    doc.fontSize(20).text('🎟️ Seu ingresso', { align: 'center' })

    doc.moveDown()

    doc.fontSize(14).text(`Pedido: ${orderId}`)

    doc.moveDown()

    // 🔥 QR Code
    const qr = await QRCode.toDataURL(
      `${process.env.API_URL}/api/checkin/${orderId}`
    )

    const base64Data = qr.replace(/^data:image\/png;base64,/, '')
    const imgBuffer = Buffer.from(base64Data, 'base64')

    doc.image(imgBuffer, {
      fit: [200, 200],
      align: 'center'
    })

    doc.moveDown()

    doc.text('Apresente este QR Code na entrada', {
      align: 'center'
    })

    doc.end()
  })
}