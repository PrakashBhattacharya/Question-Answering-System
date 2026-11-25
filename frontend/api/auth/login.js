import { createToken } from '../_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });

  const body = req.body || {};
  const email = (body.email || '').trim().toLowerCase();

  const validEmail = email || 'demo@contextiq.ai';
  const name = validEmail.includes('prakash') ? 'Prakash Bhattacharya' : (validEmail === 'demo@contextiq.ai' ? 'Demo User' : validEmail.split('@')[0]);

  const user = {
    id: `user_${Date.now()}`,
    email: validEmail,
    full_name: name,
  };

  const token = createToken({ sub: validEmail, id: user.id });
  return res.status(200).json({
    access_token: token,
    token_type: 'bearer',
    user,
  });
}
