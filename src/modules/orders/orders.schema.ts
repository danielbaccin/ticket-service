import { z } from 'zod'

export const createOrderSchema = z.object({
  event_id: z.string(),
  buyer_name: z.string(),
  buyer_email: z.string().email(),
  tickets: z.array(
    z.object({
      ticket_type_id: z.string(),
      holder_name: z.string()
    })
  )
})