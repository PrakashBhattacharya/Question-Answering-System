import { getBaseUrl, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, createToken } from '../../../_utils.js';

export default async function handler(req, res) {
  const baseUrl = getBaseUrl(req);
  const { code, error } = req.query || {};

  if (error || !code) {
    const msg = error || 'GitHub login cancelled.';
    return res.redirect(302, `${baseUrl}/oauth-callback?error=${encodeURIComponent(msg)}`);
  }

  const redirectUri = `${baseUrl}/api/auth/oauth/github/callback`;

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      const detail = tokenData.error_description || tokenData.error || 'GitHub token exchange failed';
      return res.redirect(302, `${baseUrl}/oauth-callback?error=${encodeURIComponent(detail)}`);
    }

    const ghHeaders = {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: 'application/json',
      'User-Agent': 'ContextIQ-App',
    };

    const userRes = await fetch('https://api.github.com/user', { headers: ghHeaders });
    const ghUser = await userRes.json();

    let email = ghUser.email;
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', { headers: ghHeaders });
      if (emailRes.ok) {
        const emails = await emailRes.json();
        const primary = emails.find(e => e.primary && e.verified);
        if (primary) email = primary.email;
        else if (emails[0]) email = emails[0].email;
      }
    }

    if (!email) {
      return res.redirect(302, `${baseUrl}/oauth-callback?error=${encodeURIComponent('GitHub did not return a verified email address.')}`);
    }

    const fullName = ghUser.name || ghUser.login || 'GitHub User';
    const userId = `github_${ghUser.id || Date.now()}`;

    const userPayload = {
      id: userId,
      email,
      full_name: fullName,
      provider: 'github',
    };

    const token = createToken({ sub: email, id: userId, provider: 'github' });
    const params = new URLSearchParams({
      token,
      user: JSON.stringify(userPayload),
    });

    return res.redirect(302, `${baseUrl}/oauth-callback?${params.toString()}`);
  } catch (err) {
    return res.redirect(302, `${baseUrl}/oauth-callback?error=${encodeURIComponent(err.message || 'GitHub OAuth failed')}`);
  }
}
