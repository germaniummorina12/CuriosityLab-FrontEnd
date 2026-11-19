import { apiClient } from '../apiClient'

export const usersApi = {
  getAll: () => apiClient.get('/users').then((r) => r.data),
  getById: (id) => apiClient.get(`/users/${id}`).then((r) => r.data),
  getByAge: (age) => apiClient.get(`/users/age/${age}`).then((r) => r.data),
  getByAgeRange: (minAge, maxAge) =>
    apiClient.get('/users/range-age', { params: { minAge, maxAge } }).then((r) => r.data),
  getByDateRange: (fromDate, untilDate) =>
    apiClient.get('/users/range-date', { params: { fromDate, UntilDate: untilDate } }).then((r) => r.data),
  getByNameLength: (length) => apiClient.get(`/users/name-length/${length}`).then((r) => r.data),
  getByName: (input) => apiClient.get(`/users/get-user-by-name/${input}`).then((r) => r.data),
  getWithoutRole: () => apiClient.get('/users/get-user-no-roles').then((r) => r.data),
  getWithoutAge: () => apiClient.get('/users/get-user-no-age').then((r) => r.data),
  getSortedByDate: () => apiClient.get('/users/sort-user-by-date').then((r) => r.data),
  getAverageAge: () => apiClient.get('/users/average-age').then((r) => r.data),
  getTotals: () => apiClient.get('/users/get-total-number-of-users-and-roles').then((r) => r.data),
  getRoles: (id) => apiClient.get(`/users/user-roles/${id}`).then((r) => r.data),
  create: (payload) => apiClient.post('/users', payload).then((r) => r.data),
  update: (id, payload) => apiClient.put(`/users/${id}`, payload).then((r) => r.data),
  updateAge: (id, payload) => apiClient.put(`/users/update-age/${id}`, payload).then((r) => r.data),
  setRoles: (userId, roleIds) =>
    apiClient.put(`/users/remove-set-roles/${userId}`, { userId, roleIds }).then((r) => r.data),
  restore: (id, payload) => apiClient.put(`/users/restore-user/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/users/${id}`).then((r) => r.data),
  bulkDelete: (ids) => apiClient.delete('/users/bulk-delete', { data: ids }).then((r) => r.data),
}
