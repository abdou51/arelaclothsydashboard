import { z } from 'zod'

export const wilayaSchema = z.object({
  _id: z.string(),
  arName: z.string(),
  frName: z.string(),
  engName: z.string(),
})

export type Wilaya = z.infer<typeof wilayaSchema>
