import { Product, productApiResponseSchema, ProductMetadata } from './schema' // Adjust the import path as necessary
import { z } from 'zod'

// Define types for the function parameters
interface FetchProductsParams {
  page?: number
  limit?: number
  category?: string
  name?: string
}

export async function fetchProducts(params: FetchProductsParams = {}): Promise<{
  products: Product[]
  metadata: ProductMetadata
}> {
  try {
    // Build the query parameters string
    const queryParams = new URLSearchParams()

    if (params.page) {
      queryParams.append('page', params.page.toString())
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params.category) {
      queryParams.append('category', params.category.toString())
    }
    if (params.name) {
      queryParams.append('name', params.name.toString())
    }
    const response = await fetch(
      `https://api.arelaclothsy.com/products?${queryParams.toString()}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }

    const result = await response.json()
    const validatedApiResponse = productApiResponseSchema.parse(result)
    const { docs: products, ...metadata } = validatedApiResponse

    return { products, metadata }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
    } else {
      console.error('Fetch error:', error)
    }
    throw error // Re-throw to ensure the calling function handles it
  }
}
