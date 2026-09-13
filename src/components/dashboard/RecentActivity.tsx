import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BookOpen,
  ClipboardCheck,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { useActivities } from '../../hooks/useMockData';
import type { ActivityType } from '../../types';

const activityIconMap: Record<
  ActivityType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  'lesson-completed': {
    icon: BookOpen,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  'quiz-completed': {
    icon: ClipboardCheck,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  'teach-back-completed': {
    icon: MessageSquare,
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  'gap-identified': {
    icon: AlertTriangle,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  'gap-resolved': {
    icon: CheckCircle,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  'assessment-taken': {
    icon: FileCheck,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  'review-completed': {
    icon: RefreshCw,
    color: 'text-slate-500',
    bg: 'bg-slate-100',
  },
  'streak-milestone': {
    icon: Flame,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
};

function formatTime(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const diffHours =
    Math.abs(now.getTime() - date.getTime()) / 36e5;

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffHours < 48) return 'Yesterday';

  return `${Math.floor(diffHours / 24)}d ago`;
}

export const RecentActivity: React.FC = () => {
  const activities = useActivities();
  const navigate = useNavigate();

  const displayActivities = activities.slice(0, 6);

  const handleViewAllActivity = () => {
    navigate('/progress');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <Card className="h-full flex flex-col p-5">

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-text-primary" />

        <h2 className="text-lg font-semibold text-text-primary">
          Recent Activity
        </h2>
      </div>

      {/* Activity List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 flex flex-col"
      >
        {displayActivities.map((activity, index) => {
          const config = activityIconMap[activity.type] ?? {
            icon: Activity,
            color: 'text-slate-500',
            bg: 'bg-slate-100',
          };

          const Icon = config.icon;

          return (
            <motion.div
              key={activity.id}
              variants={itemVariants}
              className={`flex items-start gap-3 py-3 ${
                index !== displayActivities.length - 1
                  ? 'border-b border-slate-100'
                  : ''
              }`}
            >
              <div
                className={`mt-0.5 shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${config.bg} ${config.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <p className="text-sm font-medium text-text-primary truncate pr-2">
                    {activity.title}
                  </p>

                  <span className="text-xs text-text-secondary whitespace-nowrap shrink-0">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-text-secondary truncate">
                    {activity.description ||
                      activity.topicName}
                  </p>

                  {activity.pointsEarned && (
                    <span className="text-xs font-semibold text-success shrink-0 ml-2">
                      +{activity.pointsEarned} pts
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {displayActivities.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center py-8">
            <div>
              <Activity className="w-8 h-8 mx-auto text-slate-300 mb-2" />

              <p className="text-sm font-semibold text-text-primary">
                No recent activity
              </p>

              <p className="text-xs text-text-secondary mt-1">
                Your learning activity will appear here.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Working Button */}
      <button
        onClick={handleViewAllActivity}
        className="w-full text-center text-sm font-medium text-primary mt-4 py-2 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
      >
        View All Activity
      </button>

    </Card>
  );
};