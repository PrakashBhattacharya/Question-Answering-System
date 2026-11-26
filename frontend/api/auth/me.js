import { verifyToken } from '../_utils.js';

export default function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json({ detail: 'Missing authorization token' });
  }

  const payload = verifyToken(token);
  if (!payload || !payload.sub) {
    // If demo token or fallback
    return res.status(200).json({
      id: 'demo_user',
      email: 'demo@contextiq.ai',
      full_name: 'Demo User',
      is_active: true,
    });
  }

  return res.status(200).json({
    id: payload.id || `user_${payload.sub}`,
    email: payload.sub,
    full_name: payload.full_name || payload.sub.split('@')[0],
    is_active: true,
  });
}
