// ─── User ──────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  grade: string;
  joinedAt: string;
  streak: number;
  echoPoints: number;
}

// ─── Topics & Progress ────────────────────────────────
export type MasteryLevel = 'novice' | 'developing' | 'proficient' | 'mastered' | 'needs-attention';

export interface Topic {
  id: string;
  name: string;
  description: string;
  order: number;
  prerequisites: string[]; // topic IDs
  estimatedHours: number;
  lessonsCount: number;
}

export interface TopicProgress {
  topicId: string;
  masteryPercentage: number;
  masteryLevel: MasteryLevel;
  lessonsCompleted: number;
  totalLessons: number;
  lastStudied: string | null;
  timeSpentMinutes: number;
  assessmentsTaken: number;
  teachBacksCompleted: number;
}

// ─── Learning Gaps ────────────────────────────────────
export type GapSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface LearningGap {
  id: string;
  topicId: string;
  topicName: string;
  severity: GapSeverity;
  description: string;
  possiblePrerequisiteId: string;
  possiblePrerequisiteName: string;
  recommendedActions: string[];
  identifiedAt: string;
  resolved: boolean;
}

// ─── AI Discoveries ───────────────────────────────────
export interface AIDiscovery {
  id: string;
  type: 'root-cause' | 'pattern' | 'strength' | 'recommendation';
  title: string;
  insight: string;
  affectedTopicId: string;
  affectedTopicName: string;
  rootCauseTopicId: string;
  rootCauseTopicName: string;
  recommendedSteps: RecommendedStep[];
  confidence: number;
  discoveredAt: string;
}

export interface RecommendedStep {
  order: number;
  action: string;
  type: 'review' | 'diagnostic' | 'teach-back' | 'practice';
  estimatedMinutes: number;
}

// ─── Activities ───────────────────────────────────────
export type ActivityType =
  | 'lesson-completed'
  | 'quiz-completed'
  | 'teach-back-completed'
  | 'gap-identified'
  | 'gap-resolved'
  | 'assessment-taken'
  | 'review-completed'
  | 'streak-milestone';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  topicId?: string;
  topicName?: string;
  score?: number;
  timestamp: string;
  pointsEarned?: number;
}

// ─── Assessments ──────────────────────────────────────
export type AssessmentType = 'adaptive-quiz' | 'diagnostic' | 'practice';
export type AssessmentStatus = 'available' | 'in-progress' | 'completed';

export interface Assessment {
  id: string;
  title: string;
  type: AssessmentType;
  topicId: string;
  topicName: string;
  questionsCount: number;
  estimatedMinutes: number;
  status: AssessmentStatus;
  score?: number;
  completedAt?: string;
  dueDate?: string;
}

// ─── Teach Back ───────────────────────────────────────
export type TeachBackStatus = 'pending' | 'in-progress' | 'completed' | 'needs-retry';

export interface TeachBackSession {
  id: string;
  topicId: string;
  topicName: string;
  prompt: string;
  studentResponse?: string;
  aiEvaluation?: {
    score: number;
    feedback: string;
    missingConcepts: string[];
    strengths: string[];
  };
  status: TeachBackStatus;
  completedAt?: string;
  createdAt: string;
}

// ─── EchoPoints ───────────────────────────────────────
export interface EchoPointsTransaction {
  id: string;
  amount: number;
  reason: string;
  type: 'earned' | 'spent';
  timestamp: string;
}

export interface EchoPointsData {
  balance: number;
  totalEarned: number;
  transactions: EchoPointsTransaction[];
}

// ─── Parent Updates ───────────────────────────────────
export type UpdateChannel = 'email' | 'sms' | 'whatsapp';

export interface ParentUpdate {
  id: string;
  sentAt: string;
  channel: UpdateChannel;
  summary: string;
  highlights: string[];
  areasOfConcern: string[];
  status: 'sent' | 'delivered' | 'read';
}

// ─── Learning Health ──────────────────────────────────
export interface LearningHealthScore {
  overall: number;
  mastery: number;
  gapClosure: number;
  consistency: number;
  engagement: number;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
}

// ─── Study Plan ───────────────────────────────────────
export type StudyItemType = 'lesson' | 'quiz' | 'teach-back' | 'review' | 'diagnostic';
export type StudyItemStatus = 'completed' | 'current' | 'upcoming' | 'locked';

export interface StudyPlanItem {
  id: string;
  topicId: string;
  topicName: string;
  type: StudyItemType;
  title: string;
  description: string;
  estimatedMinutes: number;
  status: StudyItemStatus;
  order: number;
}

export interface StudyPlan {
  id: string;
  items: StudyPlanItem[];
  generatedAt: string;
  adaptedCount: number;
}

// ─── Learning Map Node ────────────────────────────────
export interface LearningMapNode {
  id: string;
  topicId: string;
  topicName: string;
  x: number;
  y: number;
  masteryLevel: MasteryLevel;
  masteryPercentage: number;
}

export interface LearningMapEdge {
  from: string;
  to: string;
}

// ─── Chart Data ───────────────────────────────────────
export interface MasteryTrendPoint {
  date: string;
  mastery: number;
}

export interface TopicPerformancePoint {
  topicName: string;
  mastery: number;
  timeSpent: number;
}

export interface WeeklyStudyPoint {
  day: string;
  minutes: number;
}
