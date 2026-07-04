const BASE_URL = import.meta.env.VITE_API_URL || "https://djhub-wftj.onrender.com"
const TOKEN_KEY = 'dj_hub_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function extractErrorMessage(body) {
  if (!body) return null
  if (typeof body.detail === 'string') return body.detail
  if (Array.isArray(body.detail)) {
    return body.detail.map((e) => e.msg).join(', ')
  }
  return null
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { ...(options.headers ?? {}) }

  if (options.body && !(options.body instanceof URLSearchParams)) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  let body = null
  try {
    body = await res.json()
  } catch {
    // no JSON body (e.g. empty response)
  }

  if (!res.ok) {
    throw new Error(extractErrorMessage(body) ?? `Request to ${path} failed with status ${res.status}`)
  }

  return body
}

export function getBranches() {
  return request('/api/branches')
}

export function getSubjects(branchId, semester) {
  return request(`/api/subjects?branch_id=${branchId}&semester=${semester}`)
}

export function getSubjectModules(subjectId) {
  return request(`/api/subjects/${subjectId}/modules`)
}

export function getSubject(subjectId) {
  return request(`/api/subjects/${subjectId}`)
}

export async function login(username, password) {
  const body = new URLSearchParams({ username, password })
  const data = await request('/api/auth/login', { method: 'POST', body })
  setToken(data.access_token)
  return data
}

export function createSubject(payload) {
  return request('/api/admin/subjects', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateSubject(subjectId, payload) {
  return request(`/api/admin/subjects/${subjectId}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export function createModule(payload) {
  return request('/api/admin/modules', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateModule(moduleId, payload) {
  return request(`/api/admin/modules/${moduleId}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export function reorderModules(subjectId, moduleIds) {
  return request(`/api/admin/subjects/${subjectId}/modules/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ module_ids: moduleIds }),
  })
}

export function createExperiment(payload) {
  return request('/api/admin/experiments', { method: 'POST', body: JSON.stringify(payload) })
}

export function createMaterial(payload) {
  return request('/api/admin/materials', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateMaterial(materialId, payload) {
  return request(`/api/admin/materials/${materialId}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export function deleteMaterial(materialId) {
  return request(`/api/admin/materials/${materialId}`, { method: 'DELETE' })
}

export function createPYQ(payload) {
  return request('/api/admin/pyqs', { method: 'POST', body: JSON.stringify(payload) })
}

export function updatePYQ(pyqId, payload) {
  return request(`/api/admin/pyqs/${pyqId}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export function deletePYQ(pyqId) {
  return request(`/api/admin/pyqs/${pyqId}`, { method: 'DELETE' })
}

export function getAdmins() {
  return request('/api/admin/users')
}

export function createAdmin(data) {
  return request('/api/admin/users', { method: 'POST', body: JSON.stringify(data) })
}

export function deleteAdmin(id) {
  return request(`/api/admin/users/${id}`, { method: 'DELETE' })
}
