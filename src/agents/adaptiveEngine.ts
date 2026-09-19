export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface AnswerRecord {
  topic: string;
  difficulty: Difficulty;
  isCorrect: boolean;
}

export interface AdaptiveAnalysis {
  nextDifficulty: Difficulty;
  learningGaps: string[];
  topicPerformance: Record<
    string,
    {
      correct: number;
      total: number;
      accuracy: number;
    }
  >;
}

/**
 * Analyze the student's assessment performance
 * and determine what they should receive next.
 */
export function analyzePerformance(
  answers: AnswerRecord[]
): AdaptiveAnalysis {
  const topicStats: Record<
    string,
    {
      correct: number;
      total: number;
    }
  > = {};

  // Calculate topic-wise performance
  for (const answer of answers) {
    if (!topicStats[answer.topic]) {
      topicStats[answer.topic] = {
        correct: 0,
        total: 0,
      };
    }

    topicStats[answer.topic].total += 1;

    if (answer.isCorrect) {
      topicStats[answer.topic].correct += 1;
    }
  }

  const topicPerformance: AdaptiveAnalysis['topicPerformance'] =
    {};

  const learningGaps: string[] = [];

  for (const [topic, stats] of Object.entries(
    topicStats
  )) {
    const accuracy =
      stats.total === 0
        ? 0
        : Math.round(
            (stats.correct / stats.total) * 100
          );

    topicPerformance[topic] = {
      correct: stats.correct,
      total: stats.total,
      accuracy,
    };

    /*
     * Less than 50% accuracy indicates
     * a possible learning gap.
     */
    if (accuracy < 50) {
      learningGaps.push(topic);
    }
  }

  // Overall performance
  const totalQuestions = answers.length;

  const totalCorrect = answers.filter(
    (answer) => answer.isCorrect
  ).length;

  const overallAccuracy =
    totalQuestions === 0
      ? 0
      : Math.round(
          (totalCorrect / totalQuestions) * 100
        );

  /*
   * Adaptive difficulty rules:
   *
   * >= 80% ? Hard
   * 50-79% ? Medium
   * < 50% ? Easy
   */
  let nextDifficulty: Difficulty;

  if (overallAccuracy >= 80) {
    nextDifficulty = 'Hard';
  } else if (overallAccuracy >= 50) {
    nextDifficulty = 'Medium';
  } else {
    nextDifficulty = 'Easy';
  }

  return {
    nextDifficulty,
    learningGaps,
    topicPerformance,
  };
}

/**
 * Decide difficulty based on the latest answer.
 */
export function getNextDifficulty(
  currentDifficulty: Difficulty,
  isCorrect: boolean
): Difficulty {
  if (isCorrect) {
    if (currentDifficulty === 'Easy') {
      return 'Medium';
    }

    if (currentDifficulty === 'Medium') {
      return 'Hard';
    }

    return 'Hard';
  }

  if (currentDifficulty === 'Hard') {
    return 'Medium';
  }

  if (currentDifficulty === 'Medium') {
    return 'Easy';
  }

  return 'Easy';
}

/**
 * Detect repeated mistakes in the same topic.
 */
export function detectLearningGaps(
  answers: AnswerRecord[]
): string[] {
  const mistakes: Record<string, number> = {};

  for (const answer of answers) {
    if (!answer.isCorrect) {
      mistakes[answer.topic] =
        (mistakes[answer.topic] || 0) + 1;
    }
  }

  return Object.entries(mistakes)
    .filter(([, count]) => count >= 2)
    .map(([topic]) => topic);
}

/**
 * Generate a simple personalized recommendation.
 */
export function generateRecommendation(
  learningGaps: string[],
  nextDifficulty: Difficulty
): string {
  if (learningGaps.length > 0) {
    return `Focus on ${learningGaps[0]} before attempting harder questions.`;
  }

  if (nextDifficulty === 'Hard') {
    return 'Great performance! You are ready for more challenging questions.';
  }

  if (nextDifficulty === 'Medium') {
    return 'Good progress. Continue practicing to improve your mastery.';
  }

  return 'Review the fundamentals and try easier questions first.';
}
