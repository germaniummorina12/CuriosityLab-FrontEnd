import { apiClient } from '../apiClient'

// Read-only dropdown source, no CRUD on the backend.
export const contactTypesApi = {
  getAll: () => apiClient.get('/contactTypes').then((r) => r.data),
}
