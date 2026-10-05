import { tokenize } from './tokenizer.js';

/**
 * Builds term-frequency map for a text
 * @param {string} text
 * @returns {Map<string, number>}
 */
export const calculateTermFrequency = (text) => {
  const tokens = tokenize(text);
  const tf = new Map();

  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  // Normalize by total tokens
  const total = tokens.length || 1;
  const normalizedTf = new Map();
  for (const [token, count] of tf.entries()) {
    normalizedTf.set(token, count / total);
  }

  return { tf: normalizedTf, tokens };
};

/**
 * Builds a shared vocabulary vector between two documents
 * @param {string} docA
 * @param {string} docB
 * @returns {{ vecA: number[], vecB: number[] }}
 */
export const vectorizePair = (docA, docB) => {
  const { tf: tfA, tokens: tokensA } = calculateTermFrequency(docA);
  const { tf: tfB, tokens: tokensB } = calculateTermFrequency(docB);

  // Union of all unique vocabulary terms
  const vocab = new Set([...tokensA, ...tokensB]);

  const vecA = [];
  const vecB = [];

  for (const term of vocab) {
    vecA.push(tfA.get(term) || 0);
    vecB.push(tfB.get(term) || 0);
  }

  return { vecA, vecB };
};
