import QRCode from 'qrcode'

export async function generateTicketQRCode(orderId: string) {
  const url = `https://seu-dominio.com/checkin/${orderId}`

  const qrCodeBase64 = await QRCode.toDataURL(url)

  return qrCodeBase64
}