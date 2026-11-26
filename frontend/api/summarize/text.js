export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const { text = '', max_length = 150, min_length = 40 } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(422).json({ detail: 'Text cannot be empty.' });
  }

  // Fast sentence-based extractive summarization
  const sentences = text
    .split(/([.!?\n]+)/)
    .filter((s) => s.trim().length > 15)
    .map((s) => s.trim());

  let summary = '';
  if (sentences.length <= 2) {
    summary = text.trim();
  } else {
    // Pick first sentence and the most informative subsequent sentence
    summary = `${sentences[0]} ${sentences[1] || ''}`.trim();
  }

  if (summary.length > max_length) {
    summary = `${summary.slice(0, max_length - 3)}...`;
  }

  return res.status(200).json({
    summary,
    original_length: text.length,
    summary_length: summary.length,
    compression_ratio: (summary.length / text.length).toFixed(2),
  });
}
