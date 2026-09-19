export interface OfflineAssessmentResult {
  id: string;
  assessmentId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  answers: Record<number, number>;
  learningGaps: string[];
  createdAt: string;
  synced: boolean;
}

const STORAGE_KEY = 'echolearn_offline_assessments';

function getStoredResults(): OfflineAssessmentResult[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error('Unable to read offline assessments:', error);
    return [];
  }
}

function saveStoredResults(
  results: OfflineAssessmentResult[]
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(results)
  );
}

/**
 * Check whether the browser currently has
 * an internet connection.
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Save an assessment locally when offline.
 */
export function saveOfflineAssessment(
  result: Omit<
    OfflineAssessmentResult,
    'id' | 'createdAt' | 'synced'
  >
): OfflineAssessmentResult {
  const offlineResult: OfflineAssessmentResult = {
    ...result,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    synced: false,
  };

  const existingResults = getStoredResults();

  existingResults.push(offlineResult);

  saveStoredResults(existingResults);

  console.log(
    'Assessment saved offline:',
    offlineResult
  );

  return offlineResult;
}

/**
 * Get all offline assessments that are
 * waiting for synchronization.
 */
export function getOfflineAssessments(): OfflineAssessmentResult[] {
  return getStoredResults().filter(
    (result) => !result.synced
  );
}

/**
 * Get every locally stored assessment.
 */
export function getAllOfflineAssessments(): OfflineAssessmentResult[] {
  return getStoredResults();
}

/**
 * Mark an offline assessment as synced.
 */
export function markAssessmentAsSynced(
  offlineId: string
): void {
  const results = getStoredResults();

  const updatedResults = results.map((result) =>
    result.id === offlineId
      ? {
          ...result,
          synced: true,
        }
      : result
  );

  saveStoredResults(updatedResults);
}

/**
 * Remove a locally stored assessment.
 */
export function clearOfflineAssessment(
  offlineId: string
): void {
  const results = getStoredResults();

  const updatedResults = results.filter(
    (result) => result.id !== offlineId
  );

  saveStoredResults(updatedResults);
}

/**
 * Remove all locally stored assessments.
 */
export function clearAllOfflineAssessments(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Store learning gaps detected while offline.
 */
export function saveOfflineLearningGaps(
  gaps: string[]
): void {
  localStorage.setItem(
    'echolearn_offline_learning_gaps',
    JSON.stringify({
      gaps,
      updatedAt: new Date().toISOString(),
    })
  );
}

/**
 * Retrieve learning gaps detected offline.
 */
export function getOfflineLearningGaps(): string[] {
  try {
    const stored = localStorage.getItem(
      'echolearn_offline_learning_gaps'
    );

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed.gaps)
      ? parsed.gaps
      : [];
  } catch (error) {
    console.error(
      'Unable to read offline learning gaps:',
      error
    );

    return [];
  }
}
