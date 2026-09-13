import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  MessageSquare,
  Layers,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface Topic {
  id: string;
  name: string;
  description: string | null;
}

interface MasteryRow {
  topic_id: string;
  mastery_score: number | null;
  confidence_score: number | null;
}

interface Dependency {
  concept_id: string;
  prerequisite_id: string;
}

interface DiscoveryStep {
  type: 'review' | 'teach-back' | 'diagnostic';
  action: string;
  estimatedMinutes: number;
}

interface DiscoveryData {
  affectedTopicName: string;
  affectedTopicId: string;
  affectedMastery: number;
  rootCauseTopicName: string;
  rootCauseTopicId: string;
  rootCauseMastery: number;
  confidence: number;
  diagnosis: string;
  diagnosisDetail: string;
  recommendedSteps: DiscoveryStep[];
}

const getStepConfig = (type: DiscoveryStep['type']) => {
  switch (type) {
    case 'review':
      return {
        icon: BookOpen,
        label: 'Concept Review',
        bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      };

    case 'teach-back':
      return {
        icon: MessageSquare,
        label: 'Teach Back',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      };

    case 'diagnostic':
      return {
        icon: ClipboardCheck,
        label: 'Diagnostic Quiz',
        bg: 'bg-cyan-50 text-cyan-700 border-cyan-100',
      };
  }
};

export const AIDiscoveryHero: React.FC = () => {
  const navigate = useNavigate();

  const [discovery, setDiscovery] =
    useState<DiscoveryData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDiscovery = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        // ---------------------------------------------
        // LOAD TOPICS
        // ---------------------------------------------
        const { data: topicRows, error: topicError } =
          await supabase
            .from('topics')
            .select('id, name, description');

        if (topicError) {
          console.error(
            'Error loading topics:',
            topicError
          );

          if (mounted) {
            setLoading(false);
          }

          return;
        }

        // ---------------------------------------------
        // LOAD STUDENT MASTERY
        // ---------------------------------------------
        const {
          data: masteryRows,
          error: masteryError,
        } = await supabase
          .from('student_mastery')
          .select(
            'topic_id, mastery_score, confidence_score'
          )
          .eq('student_id', user.id);

        if (masteryError) {
          console.error(
            'Error loading student mastery:',
            masteryError
          );

          if (mounted) {
            setLoading(false);
          }

          return;
        }

        // ---------------------------------------------
        // LOAD CONCEPT DEPENDENCIES
        // ---------------------------------------------
        const {
          data: dependencyRows,
          error: dependencyError,
        } = await supabase
          .from('concept_dependencies')
          .select(
            'concept_id, prerequisite_id'
          );

        if (dependencyError) {
          console.error(
            'Error loading dependencies:',
            dependencyError
          );

          if (mounted) {
            setLoading(false);
          }

          return;
        }

        const topics: Topic[] =
          topicRows ?? [];

        const mastery: MasteryRow[] =
          masteryRows ?? [];

        const dependencies: Dependency[] =
          dependencyRows ?? [];

        // ---------------------------------------------
        // NO MASTERY DATA
        // ---------------------------------------------
        if (mastery.length === 0) {
          if (mounted) {
            setDiscovery(null);
            setLoading(false);
          }

          return;
        }

        // ---------------------------------------------
        // CREATE LOOKUP MAPS
        // ---------------------------------------------
        const topicMap = new Map<
          string,
          Topic
        >();

        topics.forEach((topic) => {
          topicMap.set(topic.id, topic);
        });

        const masteryMap = new Map<
          string,
          MasteryRow
        >();

        mastery.forEach((row) => {
          masteryMap.set(
            row.topic_id,
            row
          );
        });

        // ---------------------------------------------
        // FIND WEAKEST TOPIC
        // ---------------------------------------------
        const weakestTopics = [...mastery].sort(
          (a, b) =>
            Number(a.mastery_score ?? 0) -
            Number(b.mastery_score ?? 0)
        );

        const weakestMasteryRow =
          weakestTopics[0];

        if (!weakestMasteryRow) {
          if (mounted) {
            setDiscovery(null);
            setLoading(false);
          }

          return;
        }

        const affectedTopic =
          topicMap.get(
            weakestMasteryRow.topic_id
          );

        if (!affectedTopic) {
          if (mounted) {
            setDiscovery(null);
            setLoading(false);
          }

          return;
        }

        const affectedMastery = Math.round(
          Number(
            weakestMasteryRow.mastery_score ?? 0
          )
        );

        // ---------------------------------------------
        // FIND PREREQUISITES
        // ---------------------------------------------
        const prerequisites =
          dependencies.filter(
            (dependency) =>
              dependency.concept_id ===
              weakestMasteryRow.topic_id
          );

        let rootCauseTopic:
          | Topic
          | undefined;

        let rootCauseMastery = 0;

        for (
          const dependency of prerequisites
        ) {
          const prerequisiteTopic =
            topicMap.get(
              dependency.prerequisite_id
            );

          if (!prerequisiteTopic) {
            continue;
          }

          const prerequisiteMastery =
            masteryMap.get(
              dependency.prerequisite_id
            );

          const score = Number(
            prerequisiteMastery?.mastery_score ??
              0
          );

          if (
            !rootCauseTopic ||
            score < rootCauseMastery
          ) {
            rootCauseTopic =
              prerequisiteTopic;

            rootCauseMastery =
              score;
          }
        }

        // ---------------------------------------------
        // FALLBACK
        // ---------------------------------------------
        if (!rootCauseTopic) {
          rootCauseTopic =
            affectedTopic;

          rootCauseMastery =
            affectedMastery;
        }

        // ---------------------------------------------
        // CONFIDENCE
        // ---------------------------------------------
        const affectedConfidence =
          Number(
            weakestMasteryRow.confidence_score ??
              0
          );

        const rootCauseConfidence =
          Number(
            masteryMap.get(
              rootCauseTopic.id
            )?.confidence_score ?? 0
          );

        const confidenceValue =
          Math.max(
            affectedConfidence,
            rootCauseConfidence
          );

        const confidence =
          confidenceValue > 0
            ? confidenceValue / 100
            : 0.75;

        // ---------------------------------------------
        // DIAGNOSIS
        // ---------------------------------------------
        let diagnosis =
          'Prerequisite Needs Reinforcement';

        if (rootCauseMastery < 40) {
          diagnosis =
            'Foundational Concept Gap';
        } else if (
          rootCauseMastery < 60
        ) {
          diagnosis =
            'Prerequisite Understanding Gap';
        }

        const diagnosisDetail =
          rootCauseMastery < 60
            ? `${rootCauseTopic.name} is below the 60% support threshold.`
            : `Strengthening ${rootCauseTopic.name} may improve your understanding of ${affectedTopic.name}.`;

        // ---------------------------------------------
        // RECOMMENDED STEPS
        // ---------------------------------------------
        const generatedSteps:
          DiscoveryStep[] = [
            {
              type: 'review',
              action:
                `Review ${rootCauseTopic.name}`,
              estimatedMinutes: 15,
            },
            {
              type: 'teach-back',
              action:
                `Explain ${rootCauseTopic.name} in your own words`,
              estimatedMinutes: 8,
            },
            {
              type: 'diagnostic',
              action:
                `Reassess ${affectedTopic.name}`,
              estimatedMinutes: 10,
            },
          ];

        const result: DiscoveryData = {
          affectedTopicName:
            affectedTopic.name,

          affectedTopicId:
            affectedTopic.id,

          affectedMastery,

          rootCauseTopicName:
            rootCauseTopic.name,

          rootCauseTopicId:
            rootCauseTopic.id,

          rootCauseMastery:
            Math.round(
              rootCauseMastery
            ),

          confidence,

          diagnosis,

          diagnosisDetail,

          recommendedSteps:
            generatedSteps,
        };

        if (mounted) {
          setDiscovery(result);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          'AI Discovery error:',
          error
        );

        if (mounted) {
          setDiscovery(null);
          setLoading(false);
        }
      }
    };

    loadDiscovery();

    return () => {
      mounted = false;
    };
  }, []);

  // ---------------------------------------------
  // NAVIGATION
  // ---------------------------------------------
  const handleStartFixing = () => {
    navigate('/gaps');
  };

  const handleStepClick = (
    step: DiscoveryStep
  ) => {
    if (
      step.type === 'teach-back'
    ) {
      navigate('/teach-back');
      return;
    }

    if (
      step.type === 'diagnostic'
    ) {
      navigate('/assessment');
      return;
    }

    if (
      discovery?.rootCauseTopicId
    ) {
      navigate(
        `/learn/${discovery.rootCauseTopicId}`
      );
      return;
    }

    navigate('/learn');
  };

  // ---------------------------------------------
  // LOADING STATE
  // ---------------------------------------------
  if (loading) {
    return (
      <div className="relative rounded-xl overflow-hidden shadow-card border border-indigo-100/80 bg-white select-none">
        <div className="absolute left-0 top-0 bottom-0 w-[4px] gradient-ai" />

        <Card className="rounded-none gradient-ai-subtle border-0 p-5 sm:p-6">
          <div className="pl-2 sm:pl-3 space-y-5">

            <div className="flex items-center justify-between">
              <div className="h-7 w-44 rounded-full bg-white/80" />

              <div className="h-7 w-40 rounded-full bg-white/80" />
            </div>

            <div className="space-y-3">
              <div className="h-8 w-11/12 rounded-lg bg-white/70" />
              <div className="h-8 w-8/12 rounded-lg bg-white/70" />
              <div className="h-4 w-10/12 rounded-lg bg-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/60 p-3.5 rounded-xl border border-indigo-100/70">
              <div className="h-20 rounded-lg bg-white/70" />
              <div className="h-20 rounded-lg bg-white/70" />
              <div className="h-20 rounded-lg bg-white/70" />
            </div>

            <div className="space-y-2.5">
              <div className="h-4 w-56 rounded bg-white/60" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="h-24 rounded-lg bg-white/70" />
                <div className="h-24 rounded-lg bg-white/70" />
                <div className="h-24 rounded-lg bg-white/70" />
              </div>
            </div>

          </div>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------
  // NO DATA STATE
  // ---------------------------------------------
  if (!discovery) {
    return (
      <div className="relative rounded-xl overflow-hidden shadow-card border border-indigo-100/80 bg-white select-none">
        <div className="absolute left-0 top-0 bottom-0 w-[4px] gradient-ai" />

        <Card className="rounded-none gradient-ai-subtle border-0 p-5 sm:p-6">
          <div className="pl-2 sm:pl-3 space-y-5">

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/90 border border-indigo-100 shadow-subtle text-xs font-semibold text-primary">
                <Sparkles className="w-3.5 h-3.5 text-accent" />

                <span>
                  EchoLearn Discovery
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary leading-snug tracking-tight">
                Complete your diagnostic to unlock{' '}

                <span className="text-primary">
                  AI Learning Discovery
                </span>
                .
              </h3>

              <p className="text-sm text-text-secondary mt-2">
                EchoLearn will analyze your mastery
                and concept dependencies to identify
                what is actually holding your learning
                back.
              </p>
            </div>

            <Button
              variant="ai"
              size="lg"
              className="font-semibold shadow-card-hover hover:shadow-elevated px-6 py-2.5"
              icon={
                <ArrowRight className="w-4 h-4" />
              }
              onClick={() =>
                navigate('/assessment')
              }
            >
              Start Diagnostic
            </Button>

          </div>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------
  // MAIN UI
  // ---------------------------------------------
  return (
    <div className="relative rounded-xl overflow-hidden shadow-card border border-indigo-100/80 bg-white select-none">
      <div className="absolute left-0 top-0 bottom-0 w-[4px] gradient-ai" />

      <Card className="rounded-none gradient-ai-subtle border-0 p-5 sm:p-6">
        <div className="pl-2 sm:pl-3 space-y-5">

          {/* HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-3">

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/90 border border-indigo-100 shadow-subtle text-xs font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5 text-accent" />

              <span>
                EchoLearn Discovery
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200/60 shadow-subtle">

              <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />

              <span className="font-semibold text-slate-700">
                {Math.round(
                  discovery.confidence *
                    100
                )}
                %
              </span>

              <span>
                Diagnostic Confidence
              </span>

            </div>
          </div>

          {/* MAIN INSIGHT */}
          <div className="space-y-1">

            <h3 className="text-xl sm:text-2xl font-bold text-text-primary leading-snug tracking-tight">

              Your difficulty with{' '}

              <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-100/90 text-amber-900 border border-amber-300/80 font-bold shadow-subtle">
                {discovery.affectedTopicName}
              </span>{' '}

              is rooted in a prerequisite gap in{' '}

              <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-100/90 text-indigo-900 border border-indigo-300/80 font-bold shadow-subtle">
                {discovery.rootCauseTopicName}
              </span>
              .

            </h3>

            <p className="text-sm text-text-secondary">
              EchoLearn analyzes your mastery and
              concept dependencies to identify what
              is actually holding your learning back.
            </p>

          </div>

          {/* ROOT CAUSE FLOW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center bg-white/90 p-3.5 rounded-xl border border-indigo-100/70 shadow-subtle">

            {/* PREREQUISITE */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50/60 border border-indigo-200/60">

              <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-subtle">
                <Layers className="w-4 h-4" />
              </div>

              <div className="min-w-0">

                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Prerequisite Gap
                </div>

                <div className="text-xs font-bold text-text-primary truncate">
                  {discovery.rootCauseTopicName}
                </div>

                <div className="text-[11px] text-indigo-700 font-medium mt-0.5">
                  {discovery.rootCauseMastery}% Mastery
                </div>

              </div>
            </div>

            {/* ACTIVE STRUGGLE */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/60 border border-amber-200/60">

              <div className="w-7 h-7 rounded-md bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-subtle">
                <AlertTriangle className="w-4 h-4" />
              </div>

              <div className="min-w-0">

                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Active Struggle
                </div>

                <div className="text-xs font-bold text-text-primary truncate">
                  {discovery.affectedTopicName}
                </div>

                <div className="text-[11px] text-amber-700 font-medium mt-0.5">
                  {discovery.affectedMastery}% Mastery
                </div>

              </div>
            </div>

            {/* AI DIAGNOSIS */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-50/60 border border-cyan-200/60">

              <div className="w-7 h-7 rounded-md bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-subtle">
                <Zap className="w-4 h-4" />
              </div>

              <div className="min-w-0">

                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                  AI Diagnosis
                </div>

                <div className="text-xs font-bold text-text-primary truncate">
                  {discovery.diagnosis}
                </div>

                <div className="text-[11px] text-cyan-700 font-medium mt-0.5">
                  {discovery.diagnosisDetail}
                </div>

              </div>
            </div>

          </div>

          {/* RECOMMENDED PATH */}
          <div className="space-y-2.5">

            <div className="flex items-center justify-between">

              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Recommended 3-Step Fix Path
              </h4>

              <span className="text-[11px] text-text-secondary">
                ~33 mins total
              </span>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">

              {discovery.recommendedSteps.map(
                (step, index) => {

                  const config =
                    getStepConfig(
                      step.type
                    );

                  const Icon =
                    config.icon;

                  return (
                    <button
                      key={`${step.type}-${index}`}
                      type="button"
                      onClick={() =>
                        handleStepClick(
                          step
                        )
                      }
                      className="text-left flex items-start gap-2.5 bg-white border border-slate-200/70 rounded-lg p-3 hover:border-indigo-300 hover:shadow-subtle transition-all cursor-pointer"
                    >

                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-extrabold shrink-0 mt-0.5">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-center justify-between gap-1 mb-1">

                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${config.bg}`}
                          >
                            {config.label}
                          </span>

                          <span className="text-[10px] font-medium text-slate-500">
                            {step.estimatedMinutes}m
                          </span>

                        </div>

                        <p className="text-xs font-semibold text-text-primary line-clamp-2 leading-tight">
                          {step.action}
                        </p>

                      </div>

                      <Icon className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-1" />

                    </button>
                  );
                }
              )}

            </div>
          </div>

          {/* CTA */}
          <div className="pt-1 flex flex-wrap items-center gap-4">

            <Button
              variant="ai"
              size="lg"
              className="font-semibold shadow-card-hover hover:shadow-elevated px-6 py-2.5"
              icon={
                <ArrowRight className="w-4 h-4" />
              }
              onClick={
                handleStartFixing
              }
            >
              Start Fixing This
            </Button>

            <span className="text-xs text-text-secondary">
              Step 1: 15-min interactive review on{' '}
              {discovery.rootCauseTopicName}
            </span>

          </div>

        </div>
      </Card>
    </div>
  );
};