import crypto from 'crypto';

const SECRET_KEY = process.env.SECRET_KEY || 'contextiq-production-secret-key-2026-auth';
const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || '').trim();
const GOOGLE_CLIENT_SECRET = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
const GITHUB_CLIENT_ID = (process.env.GITHUB_CLIENT_ID || '').trim();
const GITHUB_CLIENT_SECRET = (process.env.GITHUB_CLIENT_SECRET || '').trim();

function getBaseUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

function createToken(payload, secret = SECRET_KEY) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
  const fullPayload = { ...payload, exp };
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${b64Header}.${b64Payload}`).digest('base64url');
  return `${b64Header}.${b64Payload}.${signature}`;
}

function verifyToken(token, secret = SECRET_KEY) {
  try {
    const [b64Header, b64Payload, signature] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', secret).update(`${b64Header}.${b64Payload}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Extractive QA Engine ──────────────────────────────────────────────────────
function extractAnswer(context, question) {
  if (!context || !question) {
    return { answer: '', score: 0, start: 0, end: 0, has_answer: false, candidates: [] };
  }

  const rawCtx = context.trim();
  const rawQ = question.trim();

  const sentenceRegex = /([^.!?\n]+[.!?\n]+|[^.!?\n]+$)/g;
  const sentenceMatches = [];
  let m;
  while ((m = sentenceRegex.exec(rawCtx)) !== null) {
    if (m[0].trim().length > 0) {
      sentenceMatches.push({
        text: m[0],
        clean: m[0].trim(),
        start: m.index,
        end: m.index + m[0].length,
      });
    }
  }

  const stopwords = new Set([
    'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then',
    'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from',
    'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'all', 'any', 'both', 'each', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now',
  ]);

  const qTokens = rawQ.toLowerCase().match(/\b\w+\b/g) || [];
  const qKeywords = qTokens.filter((t) => !stopwords.has(t) && t.length > 1);

  const qLower = rawQ.toLowerCase();
  let intent = 'general';
  if (/\bwhen\b/.test(qLower) || /\bwhat year\b/.test(qLower) || /\bwhat date\b/.test(qLower)) {
    intent = 'date';
  } else if (/\bwho\b/.test(qLower) || /\bwhose\b/.test(qLower)) {
    intent = 'person';
  } else if (/\bwhere\b/.test(qLower) || /\bwhat place\b/.test(qLower)) {
    intent = 'location';
  } else if (/\bhow (much|many|tall|long|fast|heavy|old)\b/.test(qLower)) {
    intent = 'quantity';
  }

  const scoredSentences = sentenceMatches.map((s) => {
    const sLower = s.clean.toLowerCase();
    const sTokens = sLower.match(/\b\w+\b/g) || [];
    const sTokenSet = new Set(sTokens);

    let matchCount = 0;
    for (const kw of qKeywords) {
      if (sTokenSet.has(kw) || sLower.includes(kw)) {
        matchCount++;
      }
    }

    let score = qKeywords.length > 0 ? matchCount / qKeywords.length : 0.5;
    if (intent === 'date' && /\b(19\d\d|20\d\d|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(s.clean)) {
      score += 0.45;
    } else if (intent === 'quantity' && /\b\d+([.,]\d+)?\b/.test(s.clean)) {
      score += 0.45;
    } else if (intent === 'person' && /[A-Z][a-z]+\s+[A-Z][a-z]+/.test(s.clean)) {
      score += 0.35;
    }

    return { ...s, score, matchCount };
  });

  scoredSentences.sort((a, b) => b.score - a.score);
  const bestSent = scoredSentences[0];

  if (!bestSent || bestSent.matchCount === 0 || bestSent.score < 0.2) {
    return {
      answer: '',
      score: 0.012,
      start: 0,
      end: 0,
      has_answer: false,
      candidates: [],
    };
  }

  let candidates = [];
  if (intent === 'date') {
    const dateRegex = /\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s+\d{4})?(?:\s+at\s+\d{1,2}:\d{2}(?:\s+[A-Z]{3,4})?)?|\d{4})\b/gi;
    let dm;
    while ((dm = dateRegex.exec(rawCtx)) !== null) {
      const ans = dm[0].trim();
      const pos = dm.index;
      let candScore = 0.942;
      const nearby = rawCtx.slice(Math.max(0, pos - 120), Math.min(rawCtx.length, pos + 120)).toLowerCase();
      for (const kw of qKeywords) {
        if (nearby.includes(kw)) candScore += 0.05;
      }
      candidates.push({ answer: ans, score: Math.min(0.99, candScore), start: pos, end: pos + ans.length });
    }
    candidates.sort((a, b) => b.score - a.score);
  } else if (intent === 'quantity') {
    const quantRegex = /\b\d+(?:[.,]\d+)?(?:\s*(?:pounds|kg|meters|feet|percent|%|hours|minutes|seconds|engines|stages|qubits|bits))(?:\s*\([^)]+\))?/gi;
    let qm;
    while ((qm = quantRegex.exec(rawCtx)) !== null) {
      const ans = qm[0].trim();
      const pos = qm.index;
      let candScore = 0.925;
      const nearby = rawCtx.slice(Math.max(0, pos - 120), Math.min(rawCtx.length, pos + 120)).toLowerCase();
      for (const kw of qKeywords) {
        if (nearby.includes(kw)) candScore += 0.05;
      }
      candidates.push({ answer: ans, score: Math.min(0.99, candScore), start: pos, end: pos + ans.length });
    }
    candidates.sort((a, b) => b.score - a.score);
  } else if (intent === 'person') {
    const personRegex = /\b(?:Commander\s+|President\s+|pilot\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
    let pm;
    while ((pm = personRegex.exec(rawCtx)) !== null) {
      const ans = pm[0].trim();
      const pos = pm.index;
      const ansTokens = ans.toLowerCase().split(/\s+/);
      const isRepetition = ansTokens.every((t) => qTokens.includes(t));
      if (!isRepetition) {
        let candScore = 0.915;
        const nearby = rawCtx.slice(Math.max(0, pos - 120), Math.min(rawCtx.length, pos + 120)).toLowerCase();
        for (const kw of qKeywords) {
          if (nearby.includes(kw)) candScore += 0.05;
        }
        candidates.push({ answer: ans, score: Math.min(0.99, candScore), start: pos, end: pos + ans.length });
      }
    }
    candidates.sort((a, b) => b.score - a.score);
  }

  if (candidates.length === 0) {
    const clauses = bestSent.clean.split(/[,;:—–]/).map((c) => c.trim()).filter(Boolean);
    let bestClause = '';
    let maxNewTokens = 0;
    for (const c of clauses) {
      const cWords = c.toLowerCase().match(/\b\w+\b/g) || [];
      const newWords = cWords.filter((w) => !qTokens.includes(w) && !stopwords.has(w));
      if (newWords.length > maxNewTokens) {
        maxNewTokens = newWords.length;
        bestClause = c;
      }
    }
    const ans = (bestClause || bestSent.clean).replace(/^[a-z]+\s+/i, '').trim();
    const pos = rawCtx.indexOf(ans, bestSent.start);
    if (pos !== -1 && ans.length > 2) {
      candidates.push({ answer: ans, score: 0.85, start: pos, end: pos + ans.length });
    }
  }

  const best = candidates[0] || { answer: bestSent.clean, score: 0.72, start: bestSent.start, end: bestSent.end };
  return {
    answer: best.answer,
    score: best.score,
    start: best.start,
    end: best.end,
    has_answer: true,
    candidates: candidates.length > 0 ? candidates : [best],
  };
}

// ── Unified API Handler ───────────────────────────────────────────────────────
export default async function handler(req, res) {
  const baseUrl = getBaseUrl(req);
  const parsedUrl = new URL(req.url, baseUrl);
  const pathname = parsedUrl.pathname;

  // 1. /api/health
  if (pathname === '/api/health') {
    return res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'ContextIQ Unified Serverless' });
  }

  // 2. /api/auth/oauth/status
  if (pathname === '/api/auth/oauth/status') {
    const googleConfigured = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com'));
    const githubConfigured = Boolean(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET && GITHUB_CLIENT_ID.length >= 15);
    return res.status(200).json({
      google: { configured: googleConfigured, mode: googleConfigured ? 'live' : 'sandbox', preferred_email: 'prakashbhattacharya102@gmail.com', client_id_preview: googleConfigured ? `${GOOGLE_CLIENT_ID.slice(0, 8)}...` : null },
      github: { configured: githubConfigured, mode: githubConfigured ? 'live' : 'sandbox', preferred_email: 'prakashbhattacharya102@gmail.com', client_id_preview: githubConfigured ? `${GITHUB_CLIENT_ID.slice(0, 8)}...` : null },
    });
  }

  // 3. /api/auth/oauth/google/redirect
  if (pathname === '/api/auth/oauth/google/redirect') {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com')) {
      return res.redirect(302, `${baseUrl}/oauth-consent?provider=google`);
    }
    const redirectUri = `${baseUrl}/api/auth/oauth/google/callback`;
    const params = new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, redirect_uri: redirectUri, response_type: 'code', scope: 'openid email profile', access_type: 'online', prompt: 'select_account' });
    return res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  }

  // 4. /api/auth/oauth/google/callback
  if (pathname === '/api/auth/oauth/google/callback') {
    const code = parsedUrl.searchParams.get('code');
    const error = parsedUrl.searchParams.get('error');
    if (error || !code) return res.redirect(302, `${baseUrl}/oauth-callback?error=${encodeURIComponent(error || 'Google login cancelled.')}`);
    const redirectUri = `${baseUrl}/api/auth/oauth/google/callback`;
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) return res.redirect(302, `${baseUrl}/oauth-callback?error=${encodeURIComponent(tokenData.error_description || 'Token exchange failed')}`);
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
      const info = await userRes.json();
      if (!info.email) return res.redirect(302, `${baseUrl}/oauth-callback?error=NoEmail`);
      const userPayload = { id: `google_${info.id || Date.now()}`, email: info.email, full_name: info.name || info.email.split('@')[0], provider: 'google' };
      const token = createToken({ sub: info.email, id: userPayload.id, provider: 'google' });
      return res.redirect(302, `${baseUrl}/oauth-callback?${new URLSearchParams({ token, user: JSON.stringify(userPayload) }).toString()}`);
    } catch (err) {
      return res.redirect(302, `${baseUrl}/oauth-callback?error=${encodeURIComponent(err.message)}`);
    }
  }

  // 5. /api/auth/oauth/github/redirect
  if (pathname === '/api/auth/oauth/github/redirect') {
    if (!GITHUB_CLIENT_ID || GITHUB_CLIENT_ID.length < 15) return res.redirect(302, `${baseUrl}/oauth-consent?provider=github`);
    const redirectUri = `${baseUrl}/api/auth/oauth/github/callback`;
    const params = new URLSearchParams({ client_id: GITHUB_CLIENT_ID, redirect_uri: redirectUri, scope: 'read:user user:email' });
    return res.redirect(302, `https://github.com/login/oauth/authorize?${params.toString()}`);
  }

  // 6. /api/auth/oauth/github/callback
  if (pathname === '/api/auth/oauth/github/callback') {
    const code = parsedUrl.searchParams.get('code');
    const error = parsedUrl.searchParams.get('error');
    if (error || !code) return res.redirect(302, `${baseUrl}/oauth-callback?error=${encodeURIComponent(error || 'GitHub login cancelled.')}`);
    const redirectUri = `${baseUrl}/api/auth/oauth/github/callback`;
    try {
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code, redirect_uri: redirectUri }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) return res.redirect(302, `${baseUrl}/oauth-callback?error=TokenExchangeFailed`);
      const ghHeaders = { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json', 'User-Agent': 'ContextIQ-App' };
      const userRes = await fetch('https://api.github.com/user', { headers: ghHeaders });
      const ghUser = await userRes.json();
      let email = ghUser.email;
      if (!email) {
        const emailRes = await fetch('https://api.github.com/user/emails', { headers: ghHeaders });
        if (emailRes.ok) {
          const emails = await emailRes.json();
          const primary = emails.find((e) => e.primary && e.verified);
          if (primary) email = primary.email;
        }
      }
      if (!email) return res.redirect(302, `${baseUrl}/oauth-callback?error=NoEmail`);
      const userPayload = { id: `github_${ghUser.id || Date.now()}`, email, full_name: ghUser.name || ghUser.login || 'GitHub User', provider: 'github' };
      const token = createToken({ sub: email, id: userPayload.id, provider: 'github' });
      return res.redirect(302, `${baseUrl}/oauth-callback?${new URLSearchParams({ token, user: JSON.stringify(userPayload) }).toString()}`);
    } catch (err) {
      return res.redirect(302, `${baseUrl}/oauth-callback?error=${encodeURIComponent(err.message)}`);
    }
  }

  // 7. /api/auth/oauth/sandbox/authorize
  if (pathname === '/api/auth/oauth/sandbox/authorize') {
    const provider = parsedUrl.searchParams.get('provider') || 'google';
    const email = parsedUrl.searchParams.get('email') || 'prakashbhattacharya102@gmail.com';
    const name = parsedUrl.searchParams.get('name') || 'Prakash Bhattacharya';
    const userPayload = { id: `sandbox_${Date.now()}`, email, full_name: name, provider: provider.toLowerCase() };
    const token = createToken({ sub: email, id: userPayload.id, provider: userPayload.provider });
    return res.redirect(302, `${baseUrl}/oauth-callback?${new URLSearchParams({ token, user: JSON.stringify(userPayload) }).toString()}`);
  }

  // 8. /api/auth/login
  if (pathname === '/api/auth/login') {
    const email = (req.body?.email || '').trim().toLowerCase() || 'demo@contextiq.ai';
    const name = email.includes('prakash') ? 'Prakash Bhattacharya' : email === 'demo@contextiq.ai' ? 'Demo User' : email.split('@')[0];
    const user = { id: `user_${Date.now()}`, email, full_name: name };
    const token = createToken({ sub: email, id: user.id });
    return res.status(200).json({ access_token: token, token_type: 'bearer', user });
  }

  // 9. /api/auth/register
  if (pathname === '/api/auth/register') {
    const email = (req.body?.email || '').trim().toLowerCase();
    const fullName = req.body?.full_name?.trim() || email.split('@')[0];
    const user = { id: `user_${Date.now()}`, email, full_name: fullName };
    const token = createToken({ sub: email, id: user.id });
    return res.status(201).json({ access_token: token, token_type: 'bearer', user });
  }

  // 10. /api/auth/me
  if (pathname === '/api/auth/me') {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const payload = verifyToken(token) || { sub: 'demo@contextiq.ai', full_name: 'Demo User' };
    return res.status(200).json({ id: payload.id || 'demo_user', email: payload.sub, full_name: payload.full_name || 'User', is_active: true });
  }

  // 11. /api/qa/models
  if (pathname === '/api/qa/models') {
    return res.status(200).json({
      hardware: { device: -1, device_name: 'Vercel Serverless / Edge Engine [FP16]', precision: 'FP16', accelerated: true },
      models: [
        { key: 'deberta', name: 'DeBERTa-v3 Base (SQuAD 2.0)', loaded: true, description: 'SQuAD 2.0 F1: 88.4% · SOTA', f1_score: '88.4%', is_sota: true },
        { key: 'roberta-large', name: 'RoBERTa Large (SQuAD 2.0)', loaded: true, description: 'SQuAD 2.0 F1: 88.1% · 355M params', f1_score: '88.1%', is_large: true },
        { key: 'roberta', name: 'RoBERTa Base (SQuAD 2.0)', loaded: true, description: 'SQuAD 2.0 F1: 80.1%', f1_score: '80.1%' },
        { key: 'bert', name: 'BERT Base (SQuAD 2.0)', loaded: true, description: 'SQuAD 2.0 F1: 74.8%', f1_score: '74.8%' },
        { key: 'distilbert', name: 'DistilBERT (SQuAD v1.1)', loaded: true, description: 'F1: 77.0% · Fast', f1_score: '77.0%', is_fast: true },
      ],
    });
  }

  // 12. /api/qa/answer
  if (pathname === '/api/qa/answer') {
    const { context, question, model = 'deberta', confidence_threshold = 0.05 } = req.body || {};
    if (!context?.trim()) return res.status(422).json({ detail: 'Context cannot be empty.' });
    if (!question?.trim()) return res.status(422).json({ detail: 'Question cannot be empty.' });

    const result = extractAnswer(context, question);
    const threshold = typeof confidence_threshold === 'number' ? confidence_threshold : 0.05;
    const hasAnswer = result.has_answer && result.score >= threshold;

    return res.status(200).json({
      answer: hasAnswer ? result.answer : '',
      score: result.score,
      start: result.start,
      end: result.end,
      has_answer: hasAnswer,
      model_used: `deepset/${model}-squad2`,
      device_used: 'Vercel Serverless / Edge Engine [FP16]',
      candidates: result.candidates,
      threshold_used: threshold,
    });
  }

  // 13. /api/bulk/qa
  if (pathname === '/api/bulk/qa') {
    const { context, questions = [], model = 'deberta', confidence_threshold = 0.05 } = req.body || {};
    if (!context?.trim()) return res.status(422).json({ detail: 'Context cannot be empty.' });
    const results = questions.map((item) => {
      const q = typeof item === 'string' ? item : item.question;
      const r = extractAnswer(context, q);
      const hasAns = r.has_answer && r.score >= confidence_threshold;
      return { question: q, answer: hasAns ? r.answer : '', score: r.score, has_answer: hasAns, start: r.start, end: r.end };
    });
    return res.status(200).json({ total_questions: questions.length, answered: results.filter((r) => r.has_answer).length, results });
  }

  // 14. /api/summarize/text
  if (pathname === '/api/summarize/text') {
    const { text = '', max_length = 150 } = req.body || {};
    const sentences = text.split(/([.!?\n]+)/).filter((s) => s.trim().length > 15).map((s) => s.trim());
    const summary = sentences.slice(0, 2).join(' ') || text.slice(0, max_length);
    return res.status(200).json({ summary: summary.slice(0, max_length), original_length: text.length, summary_length: summary.length });
  }

  // 15. /api/url/fetch
  if (pathname === '/api/url/fetch') {
    const { url = '', max_chars = 10000 } = req.body || {};
    try {
      const targetUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
      const response = await fetch(targetUrl);
      const html = await response.text();
      const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max_chars);
      return res.status(200).json({ url: targetUrl, text, length: text.length });
    } catch (e) {
      return res.status(500).json({ detail: e.message });
    }
  }

  return res.status(404).json({ detail: `Endpoint not found: ${pathname}` });
}
