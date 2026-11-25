import { getBaseUrl, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, createToken } from '../../../_utils.js';

export default async function handler(req, res) {
  const baseUrl = getBaseUrl(req);
  const { code, error } = req.query || {};

  if (error || !code) {
    const msg = error || 'Google login cancelled.';
    return res.redirect(302, `${baseUrl}/oauth-callback?error=${encodeURIComponent(msg)}`);
  }

  const redirectUri = `${baseUrl}/api/auth/oauth/google/callback`;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      const detail = tokenData.error_description || tokenData.error || 'Token exchange failed';
      return res.redirect(302, `${baseUrl}/oauth-callback?error=${encodeURIComponent('Google Token Exchange Failed: ' + detail)}`);
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const info = await userRes.json();

    if (!userRes.ok || !info.email) {
      return res.redirect(302, `${baseUrl}/oauth-callback?error=${encodeURIComponent('Google did not return an email address.')}`);
    }

    const email = info.email;
    const fullName = info.name || info.email.split('@')[0] || 'Google User';
    const userId = `google_${info.id || Date.now()}`;

    const userPayload = {
      id: userId,
      email,
      full_name: fullName,
      provider: 'google',
    };

    const token = createToken({ sub: email, id: userId, provider: 'google' });
    const params = new URLSearchParams({
      token,
      user: JSON.stringify(userPayload),
    });

    return res.redirect(302, `${baseUrl}/oauth-callback?${params.toString()}`);
  } catch (err) {
    return res.redirect(302, `${baseUrl}/oauth-callback?error=${encodeURIComponent(err.message || 'OAuth failed')}`);
  }
}
