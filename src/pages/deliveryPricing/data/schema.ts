import { z } from 'zod'

export const wilayaSchema = z.object({
  _id: z.string(),
  name: z.string(),
  deskPrice: z.number().optional(),
  homePrice: z.number().optional(),
})

export type Wilaya = z.infer<typeof wilayaSchema>
