import { vectorizePair } from './vectorizer.js';

/**
 * Calculates dot product of two vectors
 */
const dotProduct = (a, b) => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
};

/**
 * Calculates Euclidean magnitude (L2 norm)
 */
const magnitude = (v) => {
  let sum = 0;
  for (let i = 0; i < v.length; i++) {
    sum += v[i] * v[i];
  }
  return Math.sqrt(sum);
};

/**
 * Calculates cosine similarity score (0.0 to 1.0)
 * @param {string} textA
 * @param {string} textB
 * @returns {number} Score from 0 to 100
 */
export const calculateCosineSimilarity = (textA, textB) => {
  if (!textA || !textB) return 0;

  const { vecA, vecB } = vectorizePair(textA, textB);
  const dot = dotProduct(vecA, vecB);
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);

  if (magA === 0 || magB === 0) return 0;

  const similarity = dot / (magA * magB);
  return Math.min(Math.max(Math.round(similarity * 100), 0), 100);
};
