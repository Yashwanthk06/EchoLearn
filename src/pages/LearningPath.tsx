import { motion } from 'framer-motion';
import { useStudyPlan } from '../hooks/useMockData';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CheckCircle, Lock, Circle, Clock, Info } from 'lucide-react';
import type { StudyItemType, StudyItemStatus } from '../types';

const typeBadge: Record<StudyItemType, { variant: 'info' | 'success' | 'warning' | 'novice' | 'danger'; label: string }> = {
  lesson: { variant: 'info', label: 'Lesson' },
  quiz: { variant: 'success', label: 'Quiz' },
  'teach-back': { variant: 'warning', label: 'Teach Back' },
  review: { variant: 'novice', label: 'Review' },
  diagnostic: { variant: 'danger', label: 'Diagnostic' },
};

function StatusIcon({ status }: { status: StudyItemStatus }) {
  if (status === 'completed')
    return <CheckCircle className="h-6 w-6 text-success bg-white rounded-full relative z-10" />;
  if (status === 'current')
    return (
      <Circle className="h-6 w-6 text-primary fill-primary bg-white rounded-full relative z-10 shadow-[0_0_0_4px_rgba(99,102,241,0.2)] animate-pulse" />
    );
  if (status === 'locked')
    return <Lock className="h-6 w-6 text-slate-400 bg-white rounded-full relative z-10" />;
  return <Circle className="h-6 w-6 text-slate-300 bg-white rounded-full relative z-10" />;
}

export function LearningPath() {
  const plan = useStudyPlan();

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Learning Path</h1>
        <p className="text-text-secondary mt-1">Your personalized adaptive roadmap</p>
      </div>

      <Card className="bg-cyan-50/50 border-cyan-100 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-cyan-900">Path Adapted</p>
          <p className="text-sm text-cyan-700 mt-1">
            This path has been adapted {plan.adaptedCount} times based on your progress to focus on
            closing knowledge gaps.
          </p>
        </div>
      </Card>

      <div className="relative pl-8 pt-4">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-4 bottom-0 w-[2px] bg-slate-200 z-0" />

        <div className="space-y-8">
          {plan.items.map((item, index) => {
            const badge = typeBadge[item.type];
            const isCurrent = item.status === 'current';
            const isCompleted = item.status === 'completed';
            const isLocked = item.status === 'locked';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="relative flex gap-6"
              >
                <div className="absolute -left-[37px] top-4">
                  <StatusIcon status={item.status} />
                </div>

                <Card
                  className={`flex-1 p-5 relative overflow-hidden ${
                    isCompleted ? 'opacity-70' : ''
                  } ${isCurrent ? 'border-primary ring-1 ring-primary/20 shadow-card-hover' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-text-primary">{item.topicName}</h3>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>

                  <p className="text-sm text-text-secondary mb-3">{item.description}</p>

                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{item.estimatedMinutes} mins</span>
                  </div>

                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[1px] rounded-lg z-10 flex items-center justify-center">
                      <div className="bg-white px-3 py-1.5 rounded-full shadow-sm text-xs font-medium text-slate-500 flex items-center gap-1.5 border border-slate-200">
                        <Lock className="h-3 w-3" /> Locked
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
