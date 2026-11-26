import { apiClient } from '../apiClient'

export const contactsApi = {
  getById: (id) => apiClient.get(`/contacts/read-contact/${id}`).then((r) => r.data),
  // Response shape: [{ id, userName, contacts: [{ id, contactType, value }] }]
  // (an array with one entry for the requested user, contacts grouped under it)
  getByUser: (userId) => apiClient.get(`/contacts/by-user/${userId}`).then((r) => r.data),
  // Backend's {id} route segment isn't bound by Add.Command (userId/contactTypeId/value only) —
  // kept 1:1 with the API's current create-contact/{id} shape, same quirk as addresses create.
  create: (userId, contactTypeId, value) =>
    apiClient
      .post(`/contacts/create-contact/${userId}`, { userId, contactTypeId, value })
      .then((r) => r.data),
  update: (id, contactTypeId, value) =>
    apiClient
      .put(`/contacts/update-contact/${id}`, { id, contactTypeId, value })
      .then((r) => r.data),
  remove: (id) => apiClient.delete(`/contacts/delete-contact/${id}`).then((r) => r.data),
  // items: [{ contactTypeId, value }] — returns the new contact ids
  bulkCreate: (userId, items) =>
    apiClient.post('/contacts/bulk', { userId, items }).then((r) => r.data),
  // items: [{ id, contactTypeId, value }]
  bulkUpdate: (userId, items) =>
    apiClient.put('/contacts/bulk', { userId, items }).then((r) => r.data),
  bulkRemove: (ids) => apiClient.delete('/contacts/bulk', { data: { ids } }).then((r) => r.data),
  // Backend route is misnamed "contact-types" but actually returns every contact
  // (userName/contactType/value) — distinct from contactTypesApi.getAll, which lists types.
  getAll: () => apiClient.get('/contacts/contact-types').then((r) => r.data),
  getByType: (contactTypeId) => apiClient.get(`/contacts/by-type/${contactTypeId}`).then((r) => r.data),
  getUsersWithoutType: (contactTypeId) =>
    apiClient.get(`/contacts/users-without-type/${contactTypeId}`).then((r) => r.data),
  getByDateRange: (fromDate, untilDate) =>
    apiClient.get('/contacts/date-range', { params: { fromDate, UntilDate: untilDate } }).then((r) => r.data),
  search: (value) => apiClient.get(`/contacts/search/${value}`).then((r) => r.data),
  getGroupedByType: (userId) => apiClient.get(`/contacts/grouped-by-type/${userId}`).then((r) => r.data),
  // Reconciles a user's full contact list in one call: items with id => update, null id => create,
  // any existing contact left out of `items` is soft-deleted on the backend.
  // items: [{ id: number|null, contactTypeId, value }]
  syncForUser: (userId, items) =>
    apiClient.put('/contacts/bulk-add', { userId, contacts: items }).then((r) => r.data),
}
