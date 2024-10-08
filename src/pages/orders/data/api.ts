import { Order, orderApiResponseSchema, OrderMetaData } from './schema' // Adjust the import path as necessary

// Define types for the function parameters
export interface FetchOrdersParams {
  page?: number
  limit?: number
  status?: string
  filter?: string
  product?: string
}

export async function fetchOrders(params: FetchOrdersParams = {}): Promise<{
  orders: Order[]
  metadata: OrderMetaData
}> {
  try {
    const queryParams = new URLSearchParams()
    const jwt = localStorage.getItem('jwt')
    if (params.page) {
      queryParams.append('page', params.page.toString())
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params.status) {
      queryParams.append('status', params.status.toString())
    }
    if (params.filter) {
      queryParams.append('filter', params.filter.toString())
    }
    if (params.product) {
      queryParams.append('product', params.product.toString())
    }
    const response = await fetch(
      `https://api.arelaclothsy.com/orders?${queryParams.toString()}`,
      {
        headers: {
          Authorization: jwt ? `Bearer ${jwt}` : '',
          'Content-Type': 'application/json',
        },
      }
    )
    if (!response.ok) {
      throw new Error('Failed to fetch orders')
    }

    const result = await response.json()
    const validatedApiResponse = orderApiResponseSchema.parse(result)
    const { docs: orders, ...metadata } = validatedApiResponse

    return { orders, metadata }
  } catch (error) {
    console.error('Error fetching orders', error)
    throw error
  }
}
