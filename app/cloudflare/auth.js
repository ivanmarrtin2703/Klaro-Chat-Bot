const COOKIE = 'citaclara_session';
const LOCAL_COOKIE = 'citaclara_local';

function b64(buf) {
  let s = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return b64(sig);
}

function readCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const part = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return part ? part.slice(name.length + 1) : null;
}

export async function createSession(env) {
  const secret = env.SESSION_SECRET || env.ADMIN_PIN || 'dev-secret';
  const exp = Date.now() + 7 * 24 * 3600 * 1000;
  const payload = `ok.${exp}`;
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifySession(env, cookieHeader) {
  const token = readCookie(cookieHeader, COOKIE);
  if (!token) return false;
  const [ok, exp, sig] = token.split('.');
  if (ok !== 'ok' || !exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  const secret = env.SESSION_SECRET || env.ADMIN_PIN || 'dev-secret';
  const expect = await hmac(secret, `${ok}.${exp}`);
  return expect === sig;
}

export function sessionCookie(token) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`;
}

export function clearCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Max-Age=0`;
}

export function checkPin(env, pin) {
  const expected = String(env.ADMIN_PIN || '1234');
  return String(pin || '') === expected;
}

/** Sesión panel Hoy: role=local + slug */
export async function createLocalSession(env, slug) {
  const secret = env.SESSION_SECRET || env.ADMIN_PIN || 'dev-secret';
  const exp = Date.now() + 7 * 24 * 3600 * 1000;
  const payload = `local.${slug}.${exp}`;
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifyLocalSession(env, cookieHeader) {
  const token = readCookie(cookieHeader, LOCAL_COOKIE);
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 4) return null;
  const [role, slug, exp, sig] = parts;
  if (role !== 'local' || !slug || !exp || !sig) return null;
  if (Number(exp) < Date.now()) return null;
  const secret = env.SESSION_SECRET || env.ADMIN_PIN || 'dev-secret';
  const expect = await hmac(secret, `${role}.${slug}.${exp}`);
  if (expect !== sig) return null;
  return { slug };
}

export function localSessionCookie(token) {
  return `${LOCAL_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`;
}

export function clearLocalCookie() {
  return `${LOCAL_COOKIE}=; Path=/; HttpOnly; Max-Age=0`;
}
