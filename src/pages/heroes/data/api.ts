import { Wilaya, wilayaSchema } from './schema' // Adjust the import path as necessary

export async function fetchWilayas(): Promise<Wilaya[]> {
  try {
    const response = await fetch('https://api.arelaclothsy.com/heroes')
    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }
    const wilayaData = (await response.json()) as Wilaya[] // Assert that the JSON is of type Wilaya[]
    console.log(wilayaData)

    // Validate each user data with Zod
    return wilayaData.map((wilaya: Wilaya) => wilayaSchema.parse(wilaya)) // Explicitly declare wilaya as type Wilaya
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error // Re-throw to handle errors in the consuming code
  }
}
