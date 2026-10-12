const ALLOWED = [
  'https://klaroapp.pages.dev',
  'https://klaro-6ug.pages.dev',
  'https://recebot.pages.dev',
  'http://127.0.0.1:8788',
  'http://localhost:8788',
  'http://127.0.0.1:8787',
  'http://localhost:8787'
];

export function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
  if (ALLOWED.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers.Vary = 'Origin';
  }
  return headers;
}

export function withCors(request, response) {
  const headers = new Headers(response.headers);
  const extra = corsHeaders(request);
  for (const [k, v] of Object.entries(extra)) headers.set(k, v);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export function corsPreflight(request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
