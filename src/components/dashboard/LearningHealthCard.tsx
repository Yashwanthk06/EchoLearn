import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { ProgressRing } from '../ui/ProgressRing';
import { ProgressBar } from '../ui/ProgressBar';
import { supabase } from '../../lib/supabase';

interface MasteryRow {
  mastery_score: number | null;
  confidence_score: number | null;
  status: string | null;
  updated_at: string | null;
}

interface HealthData {
  overall: number;
  mastery: number;
  gapClosure: number;
  consistency: number;
  engagement: number;
}

export const LearningHealthCard: React.FC = () => {
  const [health, setHealth] = useState<HealthData>({
    overall: 0,
    mastery: 0,
    gapClosure: 0,
    consistency: 0,
    engagement: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLearningHealth = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const { data: masteryRows, error } = await supabase
          .from('student_mastery')
          .select(
            'mastery_score, confidence_score, status, updated_at'
          )
          .eq('student_id', user.id);

        if (error) {
          console.error(
            'Error loading learning health:',
            error
          );
          return;
        }

        const rows: MasteryRow[] = masteryRows ?? [];

        if (rows.length === 0) {
          setHealth({
            overall: 0,
            mastery: 0,
            gapClosure: 0,
            consistency: 0,
            engagement: 0,
          });

          return;
        }

        /*
         * Average mastery across assessed topics.
         */
        const masteryValues = rows.map(
          (row) => Number(row.mastery_score ?? 0)
        );

        const averageMastery =
          masteryValues.reduce(
            (sum, value) => sum + value,
            0
          ) / masteryValues.length;

        /*
         * Confidence represents how certain EchoLearn is
         * about the student's current understanding.
         */
        const confidenceValues = rows.map(
          (row) => Number(row.confidence_score ?? 0)
        );

        const averageConfidence =
          confidenceValues.reduce(
            (sum, value) => sum + value,
            0
          ) / confidenceValues.length;

        /*
         * Gap closure:
         * percentage of assessed concepts that are currently
         * at or above the 75% mastery threshold.
         */
        const strongTopics = rows.filter(
          (row) => Number(row.mastery_score ?? 0) >= 75
        ).length;

        const gapClosure =
          (strongTopics / rows.length) * 100;

        /*
         * Consistency:
         * based on how recently mastery records were updated.
         * Recent activity gets a higher score.
         */
        const now = Date.now();

        const recentRows = rows.filter((row) => {
          if (!row.updated_at) return false;

          const updatedAt = new Date(
            row.updated_at
          ).getTime();

          const daysSinceUpdate =
            (now - updatedAt) / 86400000;

          return daysSinceUpdate <= 7;
        }).length;

        const consistency =
          (recentRows / rows.length) * 100;

        /*
         * Engagement:
         * combines assessment coverage and confidence.
         * This keeps the dashboard meaningful even before
         * a larger activity system is connected.
         */
        const engagement = Math.round(
          averageConfidence * 0.6 +
            Math.min(rows.length / 10, 1) * 40
        );

        /*
         * Overall health combines:
         * - mastery
         * - gap closure
         * - consistency
         * - engagement
         */
        const overall = Math.round(
          averageMastery * 0.45 +
            gapClosure * 0.2 +
            consistency * 0.15 +
            engagement * 0.2
        );

        setHealth({
          overall: Math.round(overall),
          mastery: Math.round(averageMastery),
          gapClosure: Math.round(gapClosure),
          consistency: Math.round(consistency),
          engagement: Math.round(engagement),
        });
      } catch (error) {
        console.error(
          'Unexpected learning health error:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadLearningHealth();
  }, []);

  const getHealthLabel = () => {
    if (health.overall >= 80) return 'Healthy';
    if (health.overall >= 60) return 'Developing';
    if (health.overall >= 40) return 'Needs Attention';
    return 'Getting Started';
  };

  const getTrajectory = () => {
    if (health.overall >= 75) {
      return 'Strong Trajectory';
    }

    if (health.overall >= 50) {
      return 'Steady Progress';
    }

    if (health.overall > 0) {
      return 'Needs Support';
    }

    return 'Awaiting Assessment';
  };

  const healthLabel = getHealthLabel();
  const trajectory = getTrajectory();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col p-5 bg-white border border-border shadow-card hover:shadow-card-hover transition-shadow duration-300">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Heart className="w-4 h-4 fill-emerald-500 text-emerald-500" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-text-primary tracking-tight">
                Learning Health
              </h2>

              <p className="text-[11px] text-text-secondary">
                Mastery, gap closure & consistency
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-semibold text-emerald-700">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />

            <span>
              {loading ? 'Analyzing' : health.overall >= 60 ? 'Improving' : 'Building'}
            </span>
          </div>
        </div>

        {/* Ring & Score */}
        <div className="flex items-center justify-center gap-6 py-2 my-auto">
          <ProgressRing
            value={health.overall}
            size={118}
            strokeWidth={10}
            gradientId="learningHealthGrad"
            gradientFrom="#6366F1"
            gradientTo="#10B981"
          >
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold tracking-tight text-text-primary">
                {loading ? '—' : `${health.overall}%`}
              </span>

              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                {loading ? 'Loading' : healthLabel}
              </span>
            </div>
          </ProgressRing>

          <div className="space-y-1 text-left">
            <div className="text-xs font-medium text-text-secondary">
              Overall Status
            </div>

            <div className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />

              <span>{loading ? 'Analyzing...' : trajectory}</span>
            </div>

            <p className="text-[11px] text-text-secondary leading-relaxed max-w-[170px]">
              {health.overall >= 75
                ? 'Your assessed concepts are solidifying steadily.'
                : health.overall >= 50
                ? 'Your understanding is developing. Focus on the identified gaps.'
                : health.overall > 0
                ? 'EchoLearn found concepts that need more focused practice.'
                : 'Complete the diagnostic assessment to build your learning health profile.'}
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-4 border-t border-slate-100 mt-3">

          {/* Mastery */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary font-medium">
                Mastery
              </span>

              <span className="font-semibold text-text-primary">
                {health.mastery}%
              </span>
            </div>

            <ProgressBar
              value={health.mastery}
              size="sm"
              color="#6366F1"
            />
          </div>

          {/* Gap Closure */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary font-medium flex items-center gap-1">
                Gap Closure
                <AlertCircle className="w-3 h-3 text-amber-500" />
              </span>

              <span className="font-semibold text-amber-600">
                {health.gapClosure}%
              </span>
            </div>

            <ProgressBar
              value={health.gapClosure}
              size="sm"
              color="#F59E0B"
            />
          </div>

          {/* Consistency */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary font-medium">
                Consistency
              </span>

              <span className="font-semibold text-emerald-600">
                {health.consistency}%
              </span>
            </div>

            <ProgressBar
              value={health.consistency}
              size="sm"
              color="#10B981"
            />
          </div>

          {/* Engagement */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary font-medium">
                Engagement
              </span>

              <span className="font-semibold text-emerald-600">
                {health.engagement}%
              </span>
            </div>

            <ProgressBar
              value={health.engagement}
              size="sm"
              color="#10B981"
            />
          </div>

        </div>
      </Card>
    </motion.div>
  );
};