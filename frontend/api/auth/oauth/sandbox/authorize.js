import { getBaseUrl, createToken } from '../../../_utils.js';

export default function handler(req, res) {
  const baseUrl = getBaseUrl(req);
  const { provider = 'google', email = 'prakashbhattacharya102@gmail.com', name = 'Prakash Bhattacharya' } = req.query || {};

  const userId = `sandbox_${Date.now()}`;
  const userPayload = {
    id: userId,
    email,
    full_name: name,
    provider: provider.toLowerCase(),
  };

  const token = createToken({ sub: email, id: userId, provider: userPayload.provider });
  const params = new URLSearchParams({
    token,
    user: JSON.stringify(userPayload),
  });

  return res.redirect(302, `${baseUrl}/oauth-callback?${params.toString()}`);
}
