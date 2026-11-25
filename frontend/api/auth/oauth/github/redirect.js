import { getBaseUrl, GITHUB_CLIENT_ID } from '../../../_utils.js';

export default function handler(req, res) {
  const baseUrl = getBaseUrl(req);
  if (!GITHUB_CLIENT_ID || GITHUB_CLIENT_ID.length < 15) {
    return res.redirect(302, `${baseUrl}/oauth-consent?provider=github`);
  }

  const redirectUri = `${baseUrl}/api/auth/oauth/github/callback`;
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
  });

  res.redirect(302, `https://github.com/login/oauth/authorize?${params.toString()}`);
}
