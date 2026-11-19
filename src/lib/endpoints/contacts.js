import { apiClient } from '../apiClient'

// Planned endpoints — not implemented on the backend yet (see the Contacts CRUD/bulk/filter tickets).
// Kept here so the UI is ready to light up as soon as the backend ships them.
export const contactsApi = {
  getByUser: (userId) => apiClient.get(`/contacts/by-user/${userId}`).then((r) => r.data),
  getById: (id) => apiClient.get(`/contacts/${id}`).then((r) => r.data),
  getByType: (contactTypeId) => apiClient.get(`/contacts/by-type/${contactTypeId}`).then((r) => r.data),
  getUsersWithoutType: (contactTypeId) =>
    apiClient.get(`/contacts/users-without-type/${contactTypeId}`).then((r) => r.data),
  getByDateRange: (fromDate, untilDate) =>
    apiClient.get('/contacts/date-range', { params: { fromDate, untilDate } }).then((r) => r.data),
  search: (term) => apiClient.get('/contacts/search', { params: { term } }).then((r) => r.data),
  getGroupedByType: (userId) => apiClient.get(`/contacts/grouped-by-type/${userId}`).then((r) => r.data),
  create: (payload) => apiClient.post('/contacts', payload).then((r) => r.data),
  update: (id, payload) => apiClient.put(`/contacts/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/contacts/${id}`).then((r) => r.data),
  bulkCreate: (userId, items) => apiClient.post('/contacts/bulk', { userId, items }).then((r) => r.data),
  bulkUpdate: (items) => apiClient.put('/contacts/bulk', { items }).then((r) => r.data),
  bulkDelete: (ids) => apiClient.delete('/contacts/bulk', { data: { ids } }).then((r) => r.data),
}
