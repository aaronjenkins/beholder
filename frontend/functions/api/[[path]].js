const API_ORIGIN = 'https://beholder-production.up.railway.app'

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const target = new URL(url.pathname + url.search, API_ORIGIN)

  return fetch(target, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.body,
    redirect: 'follow',
  })
}
