import http from 'node:http'

const PORT = Number(process.env.PORT || 3000)
const allowedOrigins = (process.env.FRONTEND_URL || '*').split(',').map(value => value.trim())

const festivals = [{
  slug: 'karwa-chauth-moon',
  title: 'Karwa Chauth Moon',
  description: 'Location-aware moonrise, direction and viewing guidance.',
  disclaimer: 'Astronomical estimates are not official religious declarations.'
}]

function cors(origin) {
  const allowed = allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin)) ? (origin || '*') : allowedOrigins[0]
  return { 'access-control-allow-origin': allowed, 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type' }
}

function json(response, status, body, origin) {
  response.writeHead(status, { ...cors(origin), 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  response.end(JSON.stringify(body))
}

async function weather(url, response, origin) {
  const latitude = Number(url.searchParams.get('latitude'))
  const longitude = Number(url.searchParams.get('longitude'))
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return json(response, 400, { error: 'Valid latitude and longitude are required.' }, origin)
  }
  const upstream = new URL('https://api.open-meteo.com/v1/forecast')
  upstream.searchParams.set('latitude', latitude.toFixed(4))
  upstream.searchParams.set('longitude', longitude.toFixed(4))
  upstream.searchParams.set('current', 'cloud_cover,precipitation,relative_humidity_2m,visibility')
  upstream.searchParams.set('forecast_days', '1')
  const result = await fetch(upstream, { signal: AbortSignal.timeout(8000) })
  if (!result.ok) throw new Error(`Weather provider returned ${result.status}`)
  const data = await result.json()
  json(response, 200, { ...data.current, fetchedAt: Date.now() }, origin)
}

const server = http.createServer(async (request, response) => {
  const origin = request.headers.origin
  if (request.method === 'OPTIONS') { response.writeHead(204, cors(origin)); return response.end() }
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
  try {
    if (request.method === 'GET' && url.pathname === '/api/health') return json(response, 200, { status: 'ok', service: 'moonwindow-api' }, origin)
    if (request.method === 'GET' && url.pathname === '/api/weather') return await weather(url, response, origin)
    if (request.method === 'GET' && url.pathname === '/api/festivals') return json(response, 200, festivals, origin)
    if (request.method === 'POST' && (url.pathname === '/api/events' || url.pathname === '/api/feedback')) {
      let body = ''
      for await (const chunk of request) { body += chunk; if (body.length > 10_000) throw new Error('Payload too large') }
      const payload = body ? JSON.parse(body) : {}
      console.info(JSON.stringify({ type: url.pathname.slice(5), timestamp: new Date().toISOString(), payload }))
      return json(response, 202, { accepted: true }, origin)
    }
    json(response, 404, { error: 'Not found' }, origin)
  } catch (error) {
    console.error(error)
    json(response, 503, { error: 'Service temporarily unavailable.' }, origin)
  }
})

server.listen(PORT, '0.0.0.0', () => console.log(`MoonWindow API listening on ${PORT}`))
