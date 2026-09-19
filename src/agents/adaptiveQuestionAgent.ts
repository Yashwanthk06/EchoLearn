import {
  getNextDifficulty,
  type Difficulty,
} from './adaptiveEngine';

import {
  questionBank,
  type AdaptiveQuestion,
} from './questionBank';

export interface AdaptiveState {
  difficulty: Difficulty;
  currentTopic?: string;
  answeredIds: string[];
}

/**
 * Select the next question based on the student's
 * latest performance.
 */
export function selectNextQuestion(
  state: AdaptiveState,
  wasCorrect: boolean,
  weakTopics: string[] = []
): AdaptiveQuestion | null {

  const nextDifficulty = getNextDifficulty(
    state.difficulty,
    wasCorrect
  );

  /*
   * First priority:
   * If the learner has a weak topic,
   * give them another question from that topic.
   */
  const preferredTopics =
    weakTopics.length > 0
      ? weakTopics
      : state.currentTopic
        ? [state.currentTopic]
        : [];

  /*
   * Try weak topic + adaptive difficulty.
   */
  for (const topic of preferredTopics) {
    const question = questionBank.find(
      (q) =>
        q.topic === topic &&
        q.difficulty === nextDifficulty &&
        !state.answeredIds.includes(q.id)
    );

    if (question) {
      return question;
    }
  }

  /*
   * Otherwise find any unused question
   * at the adaptive difficulty.
   */
  const sameDifficulty = questionBank.find(
    (q) =>
      q.difficulty === nextDifficulty &&
      !state.answeredIds.includes(q.id)
  );

  if (sameDifficulty) {
    return sameDifficulty;
  }

  /*
   * If no question exists at that difficulty,
   * try another unused question.
   */
  const fallback = questionBank.find(
    (q) => !state.answeredIds.includes(q.id)
  );

  return fallback ?? null;
}

/**
 * Get the initial question for an assessment.
 */
export function getInitialQuestion(): AdaptiveQuestion | null {
  return (
    questionBank.find(
      (question) =>
        question.difficulty === 'Easy'
    ) ?? null
  );
}
