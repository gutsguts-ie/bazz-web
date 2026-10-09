// Server-only: forwards a request to the backend at API_BASE_URL.
// Never import this from client components — it reads a private env var.

// Headers that describe a single hop and must not be forwarded.
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
])

// Browser-side context the backend has no business seeing.
const STRIP_REQUEST = new Set(['cookie', 'origin', 'referer'])

// fetch() already decoded the body, so the original encoding/length are wrong.
const STRIP_RESPONSE = new Set(['content-encoding', 'content-length', 'set-cookie'])

function clientIp(headers) {
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    ''
  )
}

export async function proxyToBackend(request) {
  const base = process.env.API_BASE_URL
  if (!base) {
    return Response.json({ message: 'API_BASE_URL is not configured' }, { status: 500 })
  }

  const origin = base.replace(/\/+$/, '')
  const { pathname, search, host, protocol } = new URL(request.url)
  const target = origin + pathname + search

  const headers = new Headers()
  for (const [key, value] of request.headers) {
    if (!HOP_BY_HOP.has(key) && !STRIP_REQUEST.has(key) && !key.startsWith('x-forwarded-')) {
      headers.set(key, value)
    }
  }
  // Keep per-user rate limiting (429s) working: the backend would otherwise
  // see every request as coming from the proxy.
  const ip = clientIp(request.headers)
  if (ip) {
    headers.set('x-forwarded-for', ip)
    headers.set('x-real-ip', ip)
  }
  headers.set('x-forwarded-host', host)
  headers.set('x-forwarded-proto', protocol.replace(':', ''))

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'

  let upstream
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      // Buffered: streaming request.body isn't reliable across runtimes, and
      // serverless functions buffer the payload anyway.
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: 'manual',
      cache: 'no-store',
    })
  } catch (err) {
    console.error('[proxy]', request.method, pathname, err)
    return Response.json({ message: 'Upstream service unavailable' }, { status: 502 })
  }

  const responseHeaders = new Headers()
  for (const [key, value] of upstream.headers) {
    if (!HOP_BY_HOP.has(key) && !STRIP_RESPONSE.has(key)) {
      responseHeaders.set(key, value)
    }
  }

  // Don't let backend redirects reveal its URL; point them back at this origin.
  const location = responseHeaders.get('location')
  if (location?.startsWith(origin)) {
    responseHeaders.set('location', location.slice(origin.length) || '/')
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}
