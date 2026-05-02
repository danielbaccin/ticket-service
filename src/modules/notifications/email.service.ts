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
  pdfBuffer: Buffer
) {
  await transporter.sendMail({
    from: `"KenuiWorks 🎟️" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Seu ingresso 🎟️',
    html: `
      <h2>Pagamento confirmado!</h2>
      <p>Seu ingresso está em anexo.</p>
    `,
    attachments: [
      {
        filename: 'ingresso.pdf',
        content: pdfBuffer
      }
    ]
  })
}