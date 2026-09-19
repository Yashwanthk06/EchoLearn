import {
  mlKnowledgeBase,
  type KnowledgeChunk,
} from '../data/mlKnowledgeBase';

/**
 * Normalize text so retrieval is not affected by
 * capitalization or punctuation.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Convert a sentence into useful search terms.
 */
function getTerms(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter((term) => term.length >= 3);
}

/**
 * Calculate how relevant a knowledge chunk is
 * to the student's question.
 */
function calculateScore(
  question: string,
  chunk: KnowledgeChunk
): number {
  const normalizedQuestion = normalize(question);
  const questionTerms = getTerms(question);

  let score = 0;

  // Exact topic match gets a strong score.
  const topic = normalize(chunk.topic);

  if (
    normalizedQuestion.includes(topic) ||
    topic.includes(normalizedQuestion)
  ) {
    score += 20;
  }

  // Exact title match gets a strong score.
  const title = normalize(chunk.title);

  if (
    normalizedQuestion.includes(title) ||
    title.includes(normalizedQuestion)
  ) {
    score += 15;
  }

  // Keyword matches.
  for (const keyword of chunk.keywords) {
    const normalizedKeyword = normalize(keyword);

    if (normalizedQuestion.includes(normalizedKeyword)) {
      score += 8;
    }

    for (const term of questionTerms) {
      if (
        normalizedKeyword === term ||
        normalizedKeyword.includes(term) ||
        term.includes(normalizedKeyword)
      ) {
        score += 2;
      }
    }
  }

  // Content word matches.
  const contentTerms = new Set(
    getTerms(chunk.content)
  );

  for (const term of questionTerms) {
    if (contentTerms.has(term)) {
      score += 1;
    }
  }

  return score;
}

/**
 * Find the most relevant ML knowledge for a question.
 *
 * This is intentionally lightweight so it can run
 * completely offline in the browser.
 */
export function retrieveKnowledge(
  question: string,
  limit = 3
): KnowledgeChunk[] {
  if (!question.trim()) {
    return [];
  }

  return mlKnowledgeBase
    .map((chunk) => ({
      chunk,
      score: calculateScore(question, chunk),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.chunk);
}

/**
 * Convert retrieved knowledge into context
 * that can be passed to the local LLM.
 */
export function buildKnowledgeContext(
  question: string,
  limit = 3
): string {
  const results = retrieveKnowledge(
    question,
    limit
  );

  if (results.length === 0) {
    return `
No highly relevant section was found in the EchoLearn
Machine Learning knowledge base.

Use your general Machine Learning knowledge carefully,
and clearly say when the requested concept is outside
the currently loaded curriculum.
`;
  }

  return results
    .map(
      (chunk, index) => `
--- Knowledge Source ${index + 1} ---
Topic: ${chunk.topic}
Title: ${chunk.title}

${chunk.content}
`
    )
    .join('\n');
}

/**
 * Return the best matching topic name.
 */
export function getBestMatchingTopic(
  question: string
): string | null {
  const results = retrieveKnowledge(question, 1);

  return results[0]?.topic ?? null;
}
