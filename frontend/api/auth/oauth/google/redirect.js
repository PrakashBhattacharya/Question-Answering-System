import { getBaseUrl, GOOGLE_CLIENT_ID } from '../../../_utils.js';

export default function handler(req, res) {
  const baseUrl = getBaseUrl(req);
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com')) {
    return res.redirect(302, `${baseUrl}/oauth-consent?provider=google`);
  }

  const redirectUri = `${baseUrl}/api/auth/oauth/google/callback`;
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
  });

  res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
