import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '../../_utils.js';

export default function handler(req, res) {
  const googleConfigured = Boolean(
    GOOGLE_CLIENT_ID &&
    GOOGLE_CLIENT_SECRET &&
    GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com')
  );

  const githubConfigured = Boolean(
    GITHUB_CLIENT_ID &&
    GITHUB_CLIENT_SECRET &&
    GITHUB_CLIENT_ID.length >= 15
  );

  return res.status(200).json({
    google: {
      configured: googleConfigured,
      mode: googleConfigured ? 'live' : 'sandbox',
      preferred_email: 'prakashbhattacharya102@gmail.com',
      client_id_preview: googleConfigured ? `${GOOGLE_CLIENT_ID.slice(0, 8)}...` : null,
    },
    github: {
      configured: githubConfigured,
      mode: githubConfigured ? 'live' : 'sandbox',
      preferred_email: 'prakashbhattacharya102@gmail.com',
      client_id_preview: githubConfigured ? `${GITHUB_CLIENT_ID.slice(0, 8)}...` : null,
    },
  });
}
