import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTopicWithProgress } from '../hooks/useMockData';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { Clock } from 'lucide-react';
import type { MasteryLevel } from '../types';

function masteryToBadgeVariant(level: MasteryLevel) {
  const map: Record<MasteryLevel, 'mastered' | 'proficient' | 'developing' | 'novice' | 'needs-attention'> = {
    mastered: 'mastered',
    proficient: 'proficient',
    developing: 'developing',
    novice: 'novice',
    'needs-attention': 'needs-attention',
  };
  return map[level] ?? 'novice';
}

export function Learn() {
    const navigate = useNavigate();
  const topicsWithProgress = useTopicWithProgress();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Learn</h1>
        <p className="text-text-secondary mt-1">Machine Learning modules</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {topicsWithProgress.map((item) => {
          const masteryLevel = item.progress?.masteryLevel ?? 'novice';
          const completed = item.progress?.lessonsCompleted ?? 0;
          const total = item.lessonsCount;
          const mastery = item.progress?.masteryPercentage ?? 0;
          const isStarted = completed > 0;
          const remainingMinutes = Math.round((total - completed) * 15);

          return (
            <motion.div key={item.id} variants={itemVariants}>
              <Card hover className="flex flex-col h-full p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-semibold text-text-primary">{item.name}</h3>
                  <Badge variant={masteryToBadgeVariant(masteryLevel)}>{masteryLevel}</Badge>
                </div>
                <p className="text-sm text-text-secondary line-clamp-2 mb-5 flex-grow">
                  {item.description}
                </p>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <ProgressBar value={mastery} size="sm" />
                    <div className="flex justify-between items-center text-xs text-text-secondary">
                      <span>{completed} / {total} lessons</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {remainingMinutes}m est.
                      </span>
                    </div>
                  </div>

                  <Button
  variant={isStarted ? 'primary' : 'secondary'}
  fullWidth
  onClick={() => navigate(`/learn/${item.id}`)}
>
  {isStarted ? 'Continue' : 'Start'}
</Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
