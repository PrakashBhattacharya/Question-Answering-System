export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const { url = '', max_chars = 10000 } = req.body || {};
  if (!url || !url.trim()) {
    return res.status(422).json({ detail: 'URL cannot be empty.' });
  }

  try {
    const targetUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (ContextIQ Knowledge Fetcher)',
      },
    });

    if (!response.ok) {
      return res.status(400).json({ detail: `Failed to fetch URL (${response.status})` });
    }

    const html = await response.text();
    // Strip scripts, styles, tags
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();

    const truncated = cleanText.slice(0, max_chars);

    return res.status(200).json({
      url: targetUrl,
      text: truncated,
      length: truncated.length,
    });
  } catch (err) {
    return res.status(500).json({ detail: `URL fetch error: ${err.message}` });
  }
}
