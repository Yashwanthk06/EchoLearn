import {
  getOfflineAssessments,
  markAssessmentAsSynced,
  type OfflineAssessmentResult,
} from './offlineAgent';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
}

/**
 * Returns whether the browser currently has
 * an internet connection.
 */
export function canSync(): boolean {
  return navigator.onLine;
}

/**
 * Get assessments waiting to be synchronized.
 */
export function getPendingSync(): OfflineAssessmentResult[] {
  return getOfflineAssessments();
}

/**
 * Sync pending offline assessments.
 *
 * The actual Supabase saving logic will be connected
 * from Assessment.tsx so we don't duplicate the
 * existing database logic.
 */
export async function syncPendingAssessments(
  saveToSupabase: (
    assessment: OfflineAssessmentResult
  ) => Promise<boolean>
): Promise<SyncResult> {
  if (!canSync()) {
    return {
      success: false,
      syncedCount: 0,
      failedCount: 0,
    };
  }

  const pending = getOfflineAssessments();

  let syncedCount = 0;
  let failedCount = 0;

  for (const assessment of pending) {
    try {
      const saved = await saveToSupabase(
        assessment
      );

      if (saved) {
        markAssessmentAsSynced(
          assessment.id
        );

        syncedCount++;
      } else {
        failedCount++;
      }
    } catch (error) {
      console.error(
        'Offline assessment sync failed:',
        error
      );

      failedCount++;
    }
  }

  return {
    success: failedCount === 0,
    syncedCount,
    failedCount,
  };
}

/**
 * Listen for the internet connection returning.
 *
 * Returns a cleanup function so React can remove
 * the event listener when the component unmounts.
 */
export function onConnectionRestored(
  callback: () => void
): () => void {
  const handleOnline = () => {
    callback();
  };

  window.addEventListener(
    'online',
    handleOnline
  );

  return () => {
    window.removeEventListener(
      'online',
      handleOnline
    );
  };
}
