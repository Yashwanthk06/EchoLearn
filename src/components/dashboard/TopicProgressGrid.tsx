import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { supabase } from '../../lib/supabase';
import type { MasteryLevel } from '../../types';

interface Topic {
  id: string;
  name: string;
  description: string;
}

interface MasteryRow {
  topic_id: string;
  mastery_score: number | null;
  assessment_count: number | null;
}

interface TopicProgress extends Topic {
  mastery: number;
  level: MasteryLevel;
  assessmentsTaken: number;
}

const getMasteryLevel = (score: number): MasteryLevel => {
  if (score >= 90) return 'mastered';
  if (score >= 75) return 'proficient';
  if (score >= 60) return 'developing';
  if (score >= 40) return 'needs-attention';
  return 'novice';
};

const formatLevel = (level: string) =>
  level
    .split('-')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');

export const TopicProgressGrid: React.FC = () => {
  const navigate = useNavigate();

  const [topics, setTopics] = useState<TopicProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState<
    'all' | 'needs-attention' | 'developing' | 'mastered'
  >('all');

  useEffect(() => {
    const loadTopicProgress = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setTopics([]);
          return;
        }

        // Load all Machine Learning topics
        const { data: topicRows, error: topicError } =
          await supabase
            .from('topics')
            .select('id, name, description')
            .order('created_at', { ascending: true });

        if (topicError) {
          console.error(
            'Error loading topics:',
            topicError
          );
          return;
        }

        // Load this student's mastery
        const { data: masteryRows, error: masteryError } =
          await supabase
            .from('student_mastery')
            .select(
              'topic_id, mastery_score, assessment_count'
            )
            .eq('student_id', user.id);

        if (masteryError) {
          console.error(
            'Error loading mastery:',
            masteryError
          );
          return;
        }

        const masteryMap = new Map<
          string,
          MasteryRow
        >();

        (masteryRows ?? []).forEach((row) => {
          masteryMap.set(row.topic_id, row);
        });

        const mappedTopics: TopicProgress[] =
          (topicRows ?? []).map((topic) => {
            const masteryRow = masteryMap.get(topic.id);

            const mastery = Math.round(
              Number(
                masteryRow?.mastery_score ?? 0
              )
            );

            return {
              id: topic.id,
              name: topic.name,
              description:
                topic.description ??
                'Learn this machine learning concept.',
              mastery,
              level: getMasteryLevel(mastery),
              assessmentsTaken:
                masteryRow?.assessment_count ?? 0,
            };
          });

        setTopics(mappedTopics);
      } catch (error) {
        console.error(
          'Unexpected topic progress error:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadTopicProgress();
  }, []);

  const filteredTopics = topics.filter((topic) => {
    if (activeFilter === 'all') return true;

    if (activeFilter === 'needs-attention') {
      return topic.level === 'needs-attention';
    }

    if (activeFilter === 'developing') {
      return topic.level === 'developing';
    }

    if (activeFilter === 'mastered') {
      return (
        topic.level === 'mastered' ||
        topic.level === 'proficient'
      );
    }

    return true;
  });

  const handleTopicClick = (topicId: string) => {
    navigate(`/learn/${topicId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  /*
   * Calculate filter counts from real data.
   */
  const needsAttentionCount = topics.filter(
    (topic) => topic.level === 'needs-attention'
  ).length;

  const developingCount = topics.filter(
    (topic) => topic.level === 'developing'
  ).length;

  const masteredCount = topics.filter(
    (topic) =>
      topic.level === 'mastered' ||
      topic.level === 'proficient'
  ).length;

  return (
    <div className="space-y-4">

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-primary">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-text-primary tracking-tight">
              Machine Learning Curriculum
            </h2>

            <p className="text-[11px] text-text-secondary">
              15 structured topics & adaptive diagnostics
            </p>
          </div>

          <Badge
            variant="novice"
            className="ml-1 text-[11px]"
          >
            {topics.length} Topics
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">

          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-subtle'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All ({topics.length})
          </button>

          <button
            onClick={() =>
              setActiveFilter('needs-attention')
            }
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'needs-attention'
                ? 'bg-indigo-600 text-white shadow-subtle'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            ⚠️ Needs Attention ({needsAttentionCount})
          </button>

          <button
            onClick={() =>
              setActiveFilter('developing')
            }
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'developing'
                ? 'bg-indigo-600 text-white shadow-subtle'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Developing ({developingCount})
          </button>

          <button
            onClick={() =>
              setActiveFilter('mastered')
            }
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'mastered'
                ? 'bg-indigo-600 text-white shadow-subtle'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Mastered / Proficient ({masteredCount})
          </button>

        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <Card
              key={item}
              className="p-5 animate-pulse"
            >
              <div className="h-4 bg-slate-100 rounded w-2/3 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-full mb-2" />
              <div className="h-3 bg-slate-100 rounded w-4/5 mb-6" />
              <div className="h-2 bg-slate-100 rounded w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredTopics.map((topic) => {
            const isNeedsAttention =
              topic.level === 'needs-attention';

            return (
              <motion.div
                key={topic.id}
                variants={itemVariants}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`h-full flex flex-col p-5 bg-white border transition-all duration-300 ${
                    isNeedsAttention
                      ? 'border-red-200 bg-gradient-to-br from-red-50/30 to-white shadow-card hover:border-red-300 hover:shadow-card-hover'
                      : 'border-border shadow-card hover:border-indigo-200 hover:shadow-card-hover'
                  }`}
                >

                  {/* Topic Header */}
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-semibold text-sm text-text-primary line-clamp-1">
                      {topic.name}
                    </h3>

                    <Badge
                      variant={topic.level}
                      className="shrink-0 text-[10px]"
                    >
                      {formatLevel(topic.level)}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed">
                    {topic.description}
                  </p>

                  {/* Mastery */}
                  <div className="mb-4 mt-auto">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary font-medium">
                        Concept Mastery
                      </span>

                      <span className="font-bold text-text-primary">
                        {topic.mastery}%
                      </span>
                    </div>

                    <ProgressBar
                      value={topic.mastery}
                      size="sm"
                      color={
                        topic.level === 'mastered'
                          ? '#10B981'
                          : topic.level === 'proficient'
                          ? '#6366F1'
                          : topic.level === 'developing'
                          ? '#F59E0B'
                          : topic.level ===
                            'needs-attention'
                          ? '#EF4444'
                          : '#94A3B8'
                      }
                    />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">

                    <div className="flex text-xs text-text-secondary gap-3 font-medium">
                      <span>
                        {topic.mastery > 0
                          ? 'Progress Active'
                          : 'Not Started'}
                      </span>

                      <span>
                        {topic.assessmentsTaken} Quizzes
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        handleTopicClick(topic.id)
                      }
                      className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:text-indigo-700 cursor-pointer"
                    >
                      <span>
                        {topic.mastery > 0
                          ? 'Continue'
                          : 'Start'}
                      </span>

                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && filteredTopics.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />

          <p className="text-sm font-semibold text-text-primary">
            No topics found
          </p>

          <p className="text-xs text-text-secondary mt-1">
            Try selecting a different curriculum filter.
          </p>
        </div>
      )}

    </div>
  );
};