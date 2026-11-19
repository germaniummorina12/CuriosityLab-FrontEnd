import { apiClient } from '../apiClient'

// Planned endpoint — not implemented on the backend yet. Read-only dropdown source, no CRUD.
export const contactTypesApi = {
  getAll: () => apiClient.get('/contact-types').then((r) => r.data),
}
