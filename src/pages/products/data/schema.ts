import { z } from 'zod'

// Updated size schema
export const sizeSchema = z.object({
  size: z.number(), // Required number
  inStock: z.boolean(), // Required boolean
  _id: z.string(), // Required string ID
})

export type Size = z.infer<typeof sizeSchema>

// Updated image schema
export const imageSchema = z.object({
  urls: z.array(z.string()), // Array of strings
  _id: z.string(), // Required string ID
  createdAt: z.string(), // Required string
  updatedAt: z.string(), // Required string
})

export type Image = z.infer<typeof imageSchema>

// Updated category schema
export const categorySchema = z.object({
  _id: z.string(), // Required string ID
  arName: z.string(), // Required string
  frName: z.string(), // Required string
  engName: z.string(), // Required string
  createdAt: z.string(), // Required string
  updatedAt: z.string(), // Required string
})

export type Category = z.infer<typeof categorySchema>

// Updated product schema
export const productSchema = z.object({
  _id: z.string(), // Required string ID
  arName: z.string(), // Required string
  frName: z.string(), // Required string
  engName: z.string(), // Required string
  new: z.boolean().default(false), // Default to false
  bestSelling: z.boolean().default(false), // Default to false
  category: categorySchema, // Using categorySchema
  images: imageSchema.optional(), // Using imageSchema, optional
  sizes: z.array(sizeSchema), // Array of sizeSchema
  arDescription: z.string(), // Required string
  frDescription: z.string(), // Required string
  engDescription: z.string(), // Required string
  price: z.number().default(0), // Default to 0
  isSale: z.boolean().default(false), // Default to false
  salePrice: z.number().default(0), // Default to 0
  saleEnds: z.string().nullable().optional(), // Nullable and optional string
  isDrafted: z.boolean().default(false), // Default to false
  createdAt: z.string(), // Required string
  updatedAt: z.string(), // Required string
})

export type Product = z.infer<typeof productSchema>

// Updated product API response schema
export const productApiResponseSchema = z.object({
  docs: z.array(productSchema), // Array of productSchema
  totalDocs: z.number(), // Required number
  limit: z.number(), // Required number
  totalPages: z.number(), // Required number
  page: z.number(), // Required number
  pagingCounter: z.number(), // Required number
  hasPrevPage: z.boolean(), // Required boolean
  hasNextPage: z.boolean(), // Required boolean
  prevPage: z.number().nullable(), // Nullable number
  nextPage: z.number().nullable(), // Nullable number
})

export type ProductApiResponse = z.infer<typeof productApiResponseSchema>
export type ProductMetadata = {
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}
