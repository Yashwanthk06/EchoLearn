import {
  BookOpen,
  ClipboardCheck,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  RefreshCw,
  Flame,
  Activity,
} from 'lucide-react';
import type { Activity as ActivityType, ActivityType as ActivityTypeEnum } from '../../types';

interface ActivityItemProps {
  activity: ActivityType;
}

const iconMap: Record<ActivityTypeEnum, { icon: React.ElementType; color: string; bg: string }> = {
  'lesson-completed': { icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'quiz-completed': { icon: ClipboardCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  'teach-back-completed': { icon: MessageSquare, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  'gap-identified': { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  'gap-resolved': { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'assessment-taken': { icon: FileCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  'review-completed': { icon: RefreshCw, color: 'text-slate-500', bg: 'bg-slate-100' },
  'streak-milestone': { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
};

function formatTime(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffHours < 48) return 'Yesterday';
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const config = iconMap[activity.type] ?? {
    icon: Activity,
    color: 'text-slate-500',
    bg: 'bg-slate-100',
  };
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`mt-0.5 shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${config.bg} ${config.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <p className="text-sm font-medium text-text-primary truncate pr-2">{activity.title}</p>
          <span className="text-xs text-text-secondary whitespace-nowrap shrink-0">
            {formatTime(activity.timestamp)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs text-text-secondary truncate">
            {activity.description || activity.topicName}
          </p>
          {activity.pointsEarned && (
            <span className="text-xs font-semibold text-success shrink-0 ml-2">
              +{activity.pointsEarned} pts
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
