import { createToken } from '../_utils.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const { full_name, email, password } = req.body || {};
  if (!email || !email.includes('@')) {
    return res.status(422).json({ detail: 'Valid email is required.' });
  }

  const userId = `user_${Date.now()}`;
  const user = {
    id: userId,
    email: email.trim().toLowerCase(),
    full_name: full_name?.trim() || email.split('@')[0],
  };

  const token = createToken({ sub: user.email, id: userId, full_name: user.full_name });
  return res.status(201).json({
    access_token: token,
    token_type: 'bearer',
    user,
  });
}
