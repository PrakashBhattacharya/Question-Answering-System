import answerHandler from '../qa/answer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const { context, questions = [], model = 'deberta', confidence_threshold = 0.05 } = req.body || {};

  if (!context || !context.trim()) {
    return res.status(422).json({ detail: 'Context cannot be empty.' });
  }

  // Handle each question using the same extraction logic
  const results = [];
  for (const item of questions) {
    const q = typeof item === 'string' ? item : item.question;
    const fakeReq = {
      method: 'POST',
      body: { context, question: q, model, confidence_threshold },
    };
    let mockResult = null;
    const fakeRes = {
      status: () => fakeRes,
      json: (data) => {
        mockResult = data;
      },
    };
    await answerHandler(fakeReq, fakeRes);
    results.push({
      question: q,
      answer: mockResult?.answer || '',
      score: mockResult?.score || 0,
      has_answer: Boolean(mockResult?.has_answer),
      start: mockResult?.start || 0,
      end: mockResult?.end || 0,
    });
  }

  return res.status(200).json({
    total_questions: questions.length,
    answered: results.filter((r) => r.has_answer).length,
    results,
  });
}
