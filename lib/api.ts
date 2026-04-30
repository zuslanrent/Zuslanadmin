const API = process.env.NEXT_PUBLIC_API_URL || "https://rentbackend-z26v.onrender.com"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("admin_token")
}
export function getAdmin() {
  if (typeof window === "undefined") return null
  const s = localStorage.getItem("admin_user")
  return s ? JSON.parse(s) : null
}
export function saveSession(user: any, token: string) {
  localStorage.setItem("admin_token", token)
  localStorage.setItem("admin_user", JSON.stringify(user))
}
export function clearSession() {
  localStorage.removeItem("admin_token")
  localStorage.removeItem("admin_user")
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken()
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Алдаа гарлаа")
  return data
}

export const api = {
  login: (email: string, password: string) =>
    request("/api/auth/admin/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  stats:  () => request("/api/admin/stats"),
  listings: (params = "") => request(`/api/admin/listings${params}`),
  getListing: (id: string) => request(`/api/listings/${id}`),
  approveListing: (id: string) => request(`/api/admin/listings/${id}/approve`, { method: "PATCH" }),
  rejectListing:  (id: string) => request(`/api/admin/listings/${id}/reject`,  { method: "PATCH" }),
  updateListingStatus: (id: string, status: string) =>
    request(`/api/admin/listings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteListing: (id: string) => request(`/api/admin/listings/${id}`, { method: "DELETE" }),
  users: () => request("/api/admin/users"),
  updateUser: (id: string, data: any) =>
    request(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteUser: (id: string) => request(`/api/admin/users/${id}`, { method: "DELETE" }),
  services: () => request("/api/admin/services"),
  createService: (data: any) =>
    request("/api/admin/services", { method: "POST", body: JSON.stringify(data) }),
  updateService: (id: string, data: any) =>
    request(`/api/admin/services/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteService: (id: string) => request(`/api/admin/services/${id}`, { method: "DELETE" }),
  products: () => request("/api/admin/products"),
  createProduct: (data: any) =>
    request("/api/admin/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) =>
    request(`/api/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request(`/api/admin/products/${id}`, { method: "DELETE" }),
}
