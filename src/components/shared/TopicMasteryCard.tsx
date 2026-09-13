import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';
import type { Topic, TopicProgress, MasteryLevel } from '../../types';

interface TopicMasteryCardProps {
  topic: Topic;
  progress?: TopicProgress;
}

const masteryToBadgeVariant = (level: MasteryLevel) => level;

const formatLevel = (level: string) =>
  level.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export function TopicMasteryCard({ topic, progress }: TopicMasteryCardProps) {
  const mastery = progress?.masteryPercentage ?? 0;
  const level = progress?.masteryLevel ?? 'novice';
  const lessonsCompleted = progress?.lessonsCompleted ?? 0;
  const timeSpent = progress?.timeSpentMinutes ?? 0;

  return (
    <Card hover className="flex flex-col h-full p-5">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-text-primary">{topic.name}</h3>
        <Badge variant={masteryToBadgeVariant(level)} className="shrink-0">
          {formatLevel(level)}
        </Badge>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-text-secondary">Mastery</span>
          <span className="font-medium">{mastery}%</span>
        </div>
        <ProgressBar value={mastery} size="sm" />
      </div>

      <div className="flex items-center justify-between text-xs text-text-secondary mt-auto pt-3 border-t border-border">
        <span>{lessonsCompleted}/{topic.lessonsCount} lessons</span>
        <span>{timeSpent}m spent</span>
      </div>

      <Button variant="secondary" size="sm" className="mt-3" icon={<ArrowRight className="h-3.5 w-3.5" />}>
        {lessonsCompleted > 0 ? 'Continue' : 'Start'}
      </Button>
    </Card>
  );
}
