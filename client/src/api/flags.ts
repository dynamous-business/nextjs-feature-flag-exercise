import type { FeatureFlag, CreateFlagInput, UpdateFlagInput, ApiError } from '@shared/types'

const API_BASE = 'http://localhost:3001/api'

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  if (!response.ok) {
    if (isJson) {
      try {
        const error: ApiError = await response.json()
        throw new Error(error.message)
      } catch (e) {
        if (e instanceof SyntaxError) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }
        throw e
      }
    }
    throw new Error(`Server error: ${response.status} ${response.statusText}`)
  }

  if (!isJson) {
    return undefined as T
  }

  try {
    return await response.json()
  } catch {
    throw new Error('Failed to parse server response')
  }
}

export async function getFlags(): Promise<FeatureFlag[]> {
  try {
    const response = await fetch(`${API_BASE}/flags`)
    return handleResponse<FeatureFlag[]>(response)
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error('Unable to connect to server. Please check your connection.')
    }
    throw e
  }
}

export async function getFlag(id: string): Promise<FeatureFlag> {
  try {
    const response = await fetch(`${API_BASE}/flags/${id}`)
    return handleResponse<FeatureFlag>(response)
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error('Unable to connect to server. Please check your connection.')
    }
    throw e
  }
}

export async function createFlag(input: CreateFlagInput): Promise<FeatureFlag> {
  try {
    const response = await fetch(`${API_BASE}/flags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    return handleResponse<FeatureFlag>(response)
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error('Unable to connect to server. Please check your connection.')
    }
    throw e
  }
}

export async function updateFlag(id: string, input: UpdateFlagInput): Promise<FeatureFlag> {
  try {
    const response = await fetch(`${API_BASE}/flags/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    return handleResponse<FeatureFlag>(response)
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error('Unable to connect to server. Please check your connection.')
    }
    throw e
  }
}

export async function deleteFlag(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/flags/${id}`, {
      method: 'DELETE',
    })
    await handleResponse<void>(response)
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error('Unable to connect to server. Please check your connection.')
    }
    throw e
  }
}
