import crypto from 'crypto';

export const SECRET_KEY = process.env.SECRET_KEY || 'contextiq-production-secret-key-2026-auth';
export const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || '').trim();
export const GOOGLE_CLIENT_SECRET = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
export const GITHUB_CLIENT_ID = (process.env.GITHUB_CLIENT_ID || '').trim();
export const GITHUB_CLIENT_SECRET = (process.env.GITHUB_CLIENT_SECRET || '').trim();

export function getBaseUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

export function createToken(payload, secret = SECRET_KEY) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days
  const fullPayload = { ...payload, exp };
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');
  return `${b64Header}.${b64Payload}.${signature}`;
}

export function verifyToken(token, secret = SECRET_KEY) {
  try {
    const [b64Header, b64Payload, signature] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', secret)
      .update(`${b64Header}.${b64Payload}`)
      .digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
