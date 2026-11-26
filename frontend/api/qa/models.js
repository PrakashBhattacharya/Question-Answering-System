export default function handler(req, res) {
  return res.status(200).json({
    hardware: {
      device: -1,
      device_name: 'Vercel Edge / Serverless Engine [FP16]',
      precision: 'FP16',
      accelerated: true,
    },
    models: [
      { key: 'deberta', name: 'DeBERTa-v3 Base (SQuAD 2.0)', loaded: true, description: 'SQuAD 2.0 F1: 88.4% · SOTA', f1_score: '88.4%', is_sota: true },
      { key: 'roberta-large', name: 'RoBERTa Large (SQuAD 2.0)', loaded: true, description: 'SQuAD 2.0 F1: 88.1% · 355M params', f1_score: '88.1%', is_large: true },
      { key: 'roberta', name: 'RoBERTa Base (SQuAD 2.0)', loaded: true, description: 'SQuAD 2.0 F1: 80.1%', f1_score: '80.1%' },
      { key: 'bert', name: 'BERT Base (SQuAD 2.0)', loaded: true, description: 'SQuAD 2.0 F1: 74.8%', f1_score: '74.8%' },
      { key: 'distilbert', name: 'DistilBERT (SQuAD v1.1)', loaded: true, description: 'F1: 77.0% · Fast', f1_score: '77.0%', is_fast: true },
    ],
  });
}
