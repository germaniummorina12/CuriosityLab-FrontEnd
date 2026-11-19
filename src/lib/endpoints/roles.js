import { apiClient } from '../apiClient'

export const rolesApi = {
  getAll: () => apiClient.get('/roles').then((r) => r.data),
  getById: (id) => apiClient.get(`/roles/${id}`).then((r) => r.data),
  getByName: (input) => apiClient.get(`/roles/get-role-by-name/${input}`).then((r) => r.data),
  getUsersInRole: (id) => apiClient.get(`/roles/role-user/${id}`).then((r) => r.data),
  getUserCounts: () => apiClient.get('/roles/count-users-roles').then((r) => r.data),
  getRolesWithoutUsers: () => apiClient.get('/roles/roles-no-users').then((r) => r.data),
  getAgeStats: () => apiClient.get('/roles/role-stats-age').then((r) => r.data),
  create: (payload) => apiClient.post('/roles', payload).then((r) => r.data),
  update: (id, payload) => apiClient.put(`/roles/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/roles/${id}`).then((r) => r.data),
  assignToUser: (roleId, userId) =>
    apiClient.post('/roles/assign-role-user', { roleId, userId }).then((r) => r.data),
  removeFromUser: (userId, roleId) =>
    apiClient.delete(`/roles/remove-user-role/${userId}/${roleId}`).then((r) => r.data),
}
