import { apiClient } from '../apiClient'

export const contactsApi = {
  getById: (id) => apiClient.get(`/contacts/read-contact/${id}`).then((r) => r.data),
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
}
