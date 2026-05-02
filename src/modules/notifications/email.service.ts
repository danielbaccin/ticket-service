import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export async function sendTicketEmail(
  to: string,
  qrCode: string
) {
  await transporter.sendMail({
    from: `"Ingressos" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Seu ingresso 🎟️',
    html: `
      <h2>Pagamento confirmado!</h2>
      <p>Apresente este QR Code na entrada:</p>
      <img src="${qrCode}" style="width:200px;height:200px;" />
    `
  })
}