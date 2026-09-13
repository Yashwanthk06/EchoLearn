import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Target,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Brain,
  GitBranch,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { supabase } from '../lib/supabase';

type Topic = {
  id: string;
  name: string;
};

type Mastery = {
  topic_id: string;
  mastery_score: number;
};

type Dependency = {
  concept_id: string;
  prerequisite_id: string;
};

type LearningGap = {
  id: string;
  topicId: string;
  topicName: string;
  mastery: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  possiblePrerequisiteName: string | null;
  possiblePrerequisiteId: string | null;
  recommendedActions: string[];
};

type GapSeverity =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

/* ---------------------------------
   Severity configuration
---------------------------------- */

const severityBorder: Record<GapSeverity, string> = {
  critical: 'border-l-red-500',
  high: 'border-l-amber-500',
  medium: 'border-l-yellow-400',
  low: 'border-l-slate-400',
};

const severityBadge: Record<
  GapSeverity,
  {
    variant: 'danger' | 'warning' | 'novice';
    label: string;
  }
> = {
  critical: {
    variant: 'danger',
    label: 'Critical',
  },
  high: {
    variant: 'warning',
    label: 'High Priority',
  },
  medium: {
    variant: 'warning',
    label: 'Medium',
  },
  low: {
    variant: 'novice',
    label: 'Low Priority',
  },
};

const severityWeight: Record<GapSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/* ---------------------------------
   Helpers
---------------------------------- */

function getSeverity(mastery: number): GapSeverity {
  if (mastery < 40) return 'critical';
  if (mastery < 60) return 'high';
  if (mastery < 75) return 'medium';

  return 'low';
}

function buildDescription(
  topicName: string,
  mastery: number,
  prerequisiteName: string | null,
  prerequisiteMastery?: number
) {
  if (
    prerequisiteName &&
    prerequisiteMastery !== undefined &&
    prerequisiteMastery < 60
  ) {
    return `You're struggling with ${topicName} (${Math.round(
      mastery
    )}% mastery). A weaker foundation in ${prerequisiteName} may be contributing to this difficulty.`;
  }

  if (prerequisiteName) {
    return `Your mastery of ${topicName} is ${Math.round(
      mastery
    )}%. Strengthening this concept while reviewing ${prerequisiteName} can improve your understanding.`;
  }

  return `Your mastery of ${topicName} is ${Math.round(
    mastery
  )}%. This concept needs more practice before you move forward.`;
}

function buildActions(
  topicName: string,
  prerequisiteName: string | null,
  mastery: number
) {
  const actions: string[] = [];

  if (prerequisiteName) {
    actions.push(
      `Review ${prerequisiteName} first to strengthen the foundation.`
    );
  }

  actions.push(
    `Learn ${topicName} again using a short focused explanation.`
  );

  if (mastery < 60) {
    actions.push(
      'Take a short reassessment to verify your understanding.'
    );
  } else {
    actions.push(
      `Complete a few practice questions on ${topicName}.`
    );
  }

  return actions;
}

/* ---------------------------------
   Page
---------------------------------- */

export function Gaps() {
  const navigate = useNavigate();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [mastery, setMastery] = useState<Mastery[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------------------------
     Load Supabase data
  ---------------------------------- */

  const loadGapData = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          'Please log in to view your learning gaps.'
        );
      }

      /* -------------------------------
         Load topics
      -------------------------------- */

      const {
        data: topicData,
        error: topicError,
      } = await supabase
        .from('topics')
        .select('id, name')
        .order('name');

      if (topicError) {
        throw new Error(
          `Unable to load topics: ${topicError.message}`
        );
      }

      /* -------------------------------
         Load student's mastery
      -------------------------------- */

      const {
        data: masteryData,
        error: masteryError,
      } = await supabase
        .from('student_mastery')
        .select('topic_id, mastery_score')
        .eq('student_id', user.id);

      if (masteryError) {
        throw new Error(
          `Unable to load mastery data: ${masteryError.message}`
        );
      }

      /* -------------------------------
         Load concept dependencies

         IMPORTANT:
         Your actual database uses:

         concept_id
         prerequisite_id
      -------------------------------- */

      const {
        data: dependencyData,
        error: dependencyError,
      } = await supabase
        .from('concept_dependencies')
        .select('concept_id, prerequisite_id');

      if (dependencyError) {
        throw new Error(
          `Unable to load concept dependencies: ${dependencyError.message}`
        );
      }

      setTopics(topicData ?? []);

      setMastery(
        (masteryData ?? []).map((item) => ({
          topic_id: item.topic_id,
          mastery_score: Number(item.mastery_score) || 0,
        }))
      );

      setDependencies(
        (dependencyData ?? []).map((item) => ({
          concept_id: item.concept_id,
          prerequisite_id: item.prerequisite_id,
        }))
      );
    } catch (err) {
      console.error(
        'Failed to load learning gaps:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load your learning gaps.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGapData();
  }, []);

  /* ---------------------------------
     Build intelligent gaps
  ---------------------------------- */

  const gaps = useMemo<LearningGap[]>(() => {
    const topicMap = new Map(
      topics.map((topic) => [topic.id, topic])
    );

    const masteryMap = new Map(
      mastery.map((item) => [
        item.topic_id,
        item.mastery_score,
      ])
    );

    const results: LearningGap[] = [];

    mastery.forEach((item) => {
      const topic = topicMap.get(item.topic_id);

      if (!topic) return;

      const score = Math.max(
        0,
        Math.min(
          100,
          Number(item.mastery_score) || 0
        )
      );

      /*
       * 75%+ is considered healthy.
       */
      if (score >= 75) return;

      const severity = getSeverity(score);

      /* -------------------------------
         Find prerequisites
      -------------------------------- */

      const prerequisiteIds = dependencies
        .filter(
          (dependency) =>
            dependency.concept_id === item.topic_id
        )
        .map(
          (dependency) =>
            dependency.prerequisite_id
        );

      /*
       * Find weakest prerequisite
       * for root-cause analysis.
       */

      let prerequisiteId: string | null = null;
      let prerequisiteScore: number | undefined;

      for (const id of prerequisiteIds) {
        const currentScore = masteryMap.get(id);

        if (currentScore === undefined) {
          continue;
        }

        if (
          prerequisiteScore === undefined ||
          currentScore < prerequisiteScore
        ) {
          prerequisiteScore = currentScore;
          prerequisiteId = id;
        }
      }

      const prerequisite = prerequisiteId
        ? topicMap.get(prerequisiteId)
        : undefined;

      const prerequisiteName =
        prerequisite?.name ?? null;

      results.push({
        id: `gap-${item.topic_id}`,
        topicId: item.topic_id,
        topicName: topic.name,
        mastery: score,
        severity,
        description: buildDescription(
          topic.name,
          score,
          prerequisiteName,
          prerequisiteScore
        ),
        possiblePrerequisiteName:
          prerequisiteName,
        possiblePrerequisiteId:
          prerequisiteId,
        recommendedActions: buildActions(
          topic.name,
          prerequisiteName,
          score
        ),
      });
    });

    /*
     * Sort by severity first,
     * then lowest mastery.
     */

    return results.sort((a, b) => {
      const severityDifference =
        severityWeight[b.severity] -
        severityWeight[a.severity];

      if (severityDifference !== 0) {
        return severityDifference;
      }

      return a.mastery - b.mastery;
    });
  }, [
    topics,
    mastery,
    dependencies,
  ]);

  /* ---------------------------------
     Summary
  ---------------------------------- */

  const criticalCount = gaps.filter(
    (gap) => gap.severity === 'critical'
  ).length;

  const highCount = gaps.filter(
    (gap) => gap.severity === 'high'
  ).length;

  const mediumCount = gaps.filter(
    (gap) => gap.severity === 'medium'
  ).length;

  const lowCount = gaps.filter(
    (gap) => gap.severity === 'low'
  ).length;

  const summaryCards = [
    {
      count: criticalCount,
      label: 'Critical',
      color: 'text-danger',
    },
    {
      count: highCount,
      label: 'High',
      color: 'text-amber-500',
    },
    {
      count: mediumCount,
      label: 'Medium',
      color: 'text-yellow-500',
    },
    {
      count: lowCount,
      label: 'Low',
      color: 'text-slate-500',
    },
  ];

  /* ---------------------------------
     Loading
  ---------------------------------- */

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-10 flex flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />

          <h2 className="font-semibold text-text-primary">
            Analyzing your learning gaps...
          </h2>

          <p className="text-sm text-text-secondary mt-1">
            EchoLearn is checking your mastery and
            concept dependencies.
          </p>
        </Card>
      </div>
    );
  }

  /* ---------------------------------
     Error
  ---------------------------------- */

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center border border-red-200">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />

          <h2 className="text-lg font-semibold text-text-primary">
            Unable to analyze learning gaps
          </h2>

          <p className="text-sm text-red-600 mt-2 break-words">
            {error}
          </p>

          <div className="flex justify-center mt-5">
            <Button
              variant="primary"
              icon={
                <RefreshCw className="h-4 w-4" />
              }
              onClick={loadGapData}
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ---------------------------------
     No mastery data yet
  ---------------------------------- */

  if (mastery.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">
              My Learning Gaps
            </h1>

            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          <p className="text-text-secondary mt-1">
            EchoLearn doesn't just find what you got
            wrong — it looks for why you're struggling.
          </p>
        </div>

        <Card className="p-5 bg-gradient-to-r from-primary/5 via-white to-cyan-50/40 border-primary/10">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Brain className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="font-semibold text-text-primary">
                Root-Cause Analysis
              </h2>

              <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                Complete an assessment first. EchoLearn
                will use your results to identify weak
                concepts and discover prerequisite gaps.
              </p>
            </div>
          </div>
        </Card>

        <EmptyState
          icon={
            <Target className="h-8 w-8 text-primary" />
          }
          title="No learning data yet"
          description="Complete your first assessment to let EchoLearn build your learning profile and identify your weak concepts."
        />

        <div className="flex justify-center">
          <Button
            variant="primary"
            icon={
              <ArrowRight className="h-4 w-4" />
            }
            onClick={() => navigate('/assessment')}
          >
            Take Assessment
          </Button>
        </div>
      </div>
    );
  }

  /* ---------------------------------
     Main UI
  ---------------------------------- */

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-text-primary">
            My Learning Gaps
          </h1>

          <Sparkles className="h-5 w-5 text-primary" />
        </div>

        <p className="text-text-secondary mt-1">
          EchoLearn doesn't just find what you got
          wrong — it looks for why you're struggling.
        </p>
      </div>

      {/* AI explanation */}

      <Card className="p-5 bg-gradient-to-r from-primary/5 via-white to-cyan-50/40 border-primary/10">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Brain className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h2 className="font-semibold text-text-primary">
              Root-Cause Analysis
            </h2>

            <p className="text-sm text-text-secondary mt-1 leading-relaxed">
              EchoLearn analyzes your weak concepts
              against their prerequisites to identify
              what may actually be causing the difficulty.
            </p>
          </div>
        </div>
      </Card>

      {/* Summary */}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryCards.map((item) => (
          <Card
            key={item.label}
            className="p-4 text-center"
          >
            <div
              className={`text-3xl font-bold ${item.color}`}
            >
              {item.count}
            </div>

            <div className="text-xs text-text-secondary font-medium uppercase mt-1">
              {item.label}
            </div>
          </Card>
        ))}
      </div>

      {/* Gap cards */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {gaps.map((gap, index) => {
          const badge =
            severityBadge[gap.severity];

          return (
            <motion.div
              key={gap.id}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.05,
              }}
            >
              <Card
                className={`p-5 border-l-4 ${
                  severityBorder[gap.severity]
                }`}
              >
                {/* Title */}

                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                      <AlertCircle
                        className={`h-5 w-5 ${
                          gap.severity ===
                          'critical'
                            ? 'text-danger'
                            : gap.severity ===
                              'high'
                            ? 'text-amber-500'
                            : gap.severity ===
                              'medium'
                            ? 'text-yellow-500'
                            : 'text-slate-400'
                        }`}
                      />

                      {gap.topicName}
                    </h3>

                    <p className="text-xs text-text-secondary mt-1">
                      Current mastery:{' '}
                      <span className="font-semibold text-text-primary">
                        {Math.round(
                          gap.mastery
                        )}
                        %
                      </span>
                    </p>
                  </div>

                  <Badge variant={badge.variant}>
                    {badge.label}
                  </Badge>
                </div>

                {/* Description */}

                <p className="text-text-primary mb-4 leading-relaxed">
                  {gap.description}
                </p>

                {/* Root cause */}

                {gap.possiblePrerequisiteName && (
                  <div className="mb-4 rounded-xl border border-primary/10 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch className="h-4 w-4 text-primary" />

                      <span className="text-sm font-semibold text-text-primary">
                        Possible Root Cause
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-text-secondary">
                        Difficulty with
                      </span>

                      <Badge variant="danger">
                        {gap.topicName}
                      </Badge>

                      <ArrowRight className="h-4 w-4 text-text-secondary" />

                      <Badge variant="warning">
                        {gap.possiblePrerequisiteName}
                      </Badge>
                    </div>

                    <p className="text-xs text-text-secondary mt-2">
                      Strengthening the prerequisite
                      may make this concept easier to
                      understand.
                    </p>
                  </div>
                )}

                {/* Recommended Plan */}

                <div className="bg-white/60 rounded-lg p-4 border border-border/50">
                  <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />

                    Recommended Plan
                  </h4>

                  <ul className="space-y-2 mb-4">
                    {gap.recommendedActions.map(
                      (action, actionIndex) => (
                        <li
                          key={actionIndex}
                          className="text-sm text-text-secondary flex gap-2"
                        >
                          <span className="font-medium text-text-primary shrink-0">
                            {actionIndex + 1}.
                          </span>

                          <span>{action}</span>
                        </li>
                      )
                    )}
                  </ul>

                  {/* Start fixing */}

                  <Button
                    variant={
                      gap.severity ===
                        'critical' ||
                      gap.severity === 'high'
                        ? 'primary'
                        : 'secondary'
                    }
                    icon={
                      <ArrowRight className="h-4 w-4" />
                    }
                    onClick={() => {
                      const targetId =
                        gap.possiblePrerequisiteId ??
                        gap.topicId;

                      navigate(
                        `/learn/${targetId}`
                      );
                    }}
                  >
                    Start Fixing
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}

        {/* No gaps */}

        {gaps.length === 0 && (
          <EmptyState
            icon={
              <ShieldAlert className="h-8 w-8 text-emerald-500" />
            }
            title="No learning gaps found!"
            description="Your current mastery looks strong. Complete more assessments to keep your learning profile updated."
          />
        )}
      </motion.div>
    </div>
  );
}