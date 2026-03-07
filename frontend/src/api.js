export function baseUrl() {
  return (import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '')
}

export function apiFetch(path, opts) {
  if (typeof path !== 'string') return fetch(path, opts)
  if (path.startsWith('http://') || path.startsWith('https://')) return fetch(path, opts)
  const base = baseUrl()
  const url = base ? `${base}${path}` : path
  return fetch(url, opts)
}

export default apiFetch
