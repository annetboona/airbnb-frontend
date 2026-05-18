import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use((config) => {
const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"]
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url ?? ""
    // Don't redirect for /auth/me — it's a non-critical profile hydration call.
    // If it 401s (stale/invalid token), AuthContext already clears the token via
    // decodeToken expiry check; forcing a page redirect here would kick users out
    // even when they're on a public page or just refreshing.
    const isProfileFetch = url.includes("/auth/me")
    if (error.response?.status === 401 && !isProfileFetch) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default api