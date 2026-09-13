import {
  mockUser,
  mockTopics,
  mockTopicProgress,
  mockLearningGaps,
  mockAIDiscoveries,
  mockActivities,
  mockAssessments,
  mockTeachBackSessions,
  mockEchoPoints,
  mockParentUpdates,
  mockLearningHealth,
  mockStudyPlan,
  mockLearningMapNodes,
  mockLearningMapEdges,
  mockMasteryTrend,
  mockTopicPerformance,
  mockWeeklyStudy,
} from '../data/mockData';

import type {
  User,
  Topic,
  TopicProgress,
  LearningGap,
  AIDiscovery,
  Activity,
  Assessment,
  TeachBackSession,
  EchoPointsData,
  ParentUpdate,
  LearningHealthScore,
  StudyPlan,
  LearningMapNode,
  LearningMapEdge,
  MasteryTrendPoint,
  TopicPerformancePoint,
  WeeklyStudyPoint,
} from '../types';

// These hooks are the integration points for Supabase.
// Replace the mock data returns with Supabase queries later.
// The component interfaces stay exactly the same.

export function useUser(): User {
  return mockUser;
}

export function useTopics(): Topic[] {
  return mockTopics;
}

export function useTopicProgress(): TopicProgress[] {
  return mockTopicProgress;
}

export function useTopicWithProgress(): (Topic & { progress: TopicProgress | undefined })[] {
  return mockTopics.map((topic) => ({
    ...topic,
    progress: mockTopicProgress.find((p) => p.topicId === topic.id),
  }));
}

export function useLearningGaps(): LearningGap[] {
  return mockLearningGaps;
}

export function useAIDiscoveries(): AIDiscovery[] {
  return mockAIDiscoveries;
}

export function usePrimaryDiscovery(): AIDiscovery {
  return mockAIDiscoveries[0];
}

export function useActivities(): Activity[] {
  return mockActivities;
}

export function useAssessments(): Assessment[] {
  return mockAssessments;
}

export function useTeachBackSessions(): TeachBackSession[] {
  return mockTeachBackSessions;
}

export function useEchoPoints(): EchoPointsData {
  return mockEchoPoints;
}

export function useParentUpdates(): ParentUpdate[] {
  return mockParentUpdates;
}

export function useLearningHealth(): LearningHealthScore {
  return mockLearningHealth;
}

export function useStudyPlan(): StudyPlan {
  return mockStudyPlan;
}

export function useLearningMap(): { nodes: LearningMapNode[]; edges: LearningMapEdge[] } {
  return { nodes: mockLearningMapNodes, edges: mockLearningMapEdges };
}

export function useMasteryTrend(): MasteryTrendPoint[] {
  return mockMasteryTrend;
}

export function useTopicPerformance(): TopicPerformancePoint[] {
  return mockTopicPerformance;
}

export function useWeeklyStudy(): WeeklyStudyPoint[] {
  return mockWeeklyStudy;
}
