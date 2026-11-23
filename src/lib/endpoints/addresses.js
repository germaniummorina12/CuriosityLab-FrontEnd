import { apiClient } from '../apiClient'

export const addressesApi = {
  getById: (id) => apiClient.get(`/addresses/${id}`).then((r) => r.data),
  getByPostalCode: (postalCode) =>
    apiClient.get(`/addresses/get-addresses-by-postalCode/${postalCode}`).then((r) => r.data),
  getUsersPerCity: () => apiClient.get('/addresses/get-users-per-city').then((r) => r.data),
  getUsersWithAddresses: () => apiClient.get('/addresses/get-user-with-Addresses').then((r) => r.data),
  // Distinct from the above despite the near-identical name — two separate backend endpoints.
  getAddressesByUsers: () => apiClient.get('/addresses/get-user-addresses').then((r) => r.data),
  getUsersWithoutAddress: () => apiClient.get('/addresses/get-user-no-Address').then((r) => r.data),
  getByStreet: (street) => apiClient.get(`/addresses/Search-street/${street}`).then((r) => r.data),
  getByCity: (city) => apiClient.get(`/addresses/Search-city/${city}`).then((r) => r.data),
  getMostCommonCity: () => apiClient.get('/addresses/Common-city').then((r) => r.data),
  getSpecificCity: (city) => apiClient.get(`/addresses/Get-user-specific-city/${city}`).then((r) => r.data),
  getByDateRange: (fromDate, untilDate) =>
    apiClient.get('/addresses/range-date', { params: { fromDate, UntilDate: untilDate } }).then((r) => r.data),
  // Create/update/delete still bound by the backend's current {id}-in-route quirk — kept 1:1 with the API.
  create: (userId, payload) => apiClient.post(`/addresses/${userId}`, { id: userId, ...payload }).then((r) => r.data),
  update: (id, payload) => apiClient.put(`/addresses/${id}`, { id, ...payload }).then((r) => r.data),
  remove: (id) => apiClient.delete(`/addresses/${id}`).then((r) => r.data),
  restore: (id) => apiClient.put(`/addresses/restore-address/${id}`, { id }).then((r) => r.data),
}
