const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

export const API_BASE_URL = (configuredApiUrl || "/api").replace(/\/$/, "")

export const apiUrl = (path) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
