import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  RotateCcw,
  Trophy,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { useAssessments } from '../hooks/useMockData';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import type { AssessmentType } from '../types';

const typeBadgeVariant: Record<
  AssessmentType,
  'info' | 'success' | 'warning'
> = {
  'adaptive-quiz': 'info',
  diagnostic: 'success',
  practice: 'warning',
};

const typeLabels: Record<AssessmentType, string> = {
  'adaptive-quiz': 'Adaptive Quiz',
  diagnostic: 'Diagnostic',
  practice: 'Practice',
};

/* ---------------------------------
   Assessment Questions
---------------------------------- */

const quizQuestions = [
  {
    id: 1,
    question:
      'Which of the following is an example of supervised learning?',
    options: [
      'Grouping customers based on purchasing behavior',
      'Predicting house prices using labeled training data',
      'Finding unusual patterns without labels',
      'Reducing the number of features using PCA',
    ],
    correctAnswer: 1,
    explanation:
      'Supervised learning uses labeled data to learn a relationship between inputs and known outputs. Predicting house prices from labeled examples is a classic example.',
    topic: 'Supervised Learning',
    difficulty: 'Easy',
  },
  {
    id: 2,
    question:
      'What is the main purpose of splitting data into training and testing sets?',
    options: [
      'To make the dataset smaller',
      'To remove incorrect data',
      'To evaluate how well the model performs on unseen data',
      'To increase the number of features',
    ],
    correctAnswer: 2,
    explanation:
      'The training set is used to learn the model, while the test set evaluates how well the trained model generalizes to unseen data.',
    topic: 'Training and Testing Data',
    difficulty: 'Easy',
  },
  {
    id: 3,
    question:
      'Which problem occurs when a model performs very well on training data but poorly on unseen data?',
    options: [
      'Underfitting',
      'Overfitting',
      'Normalization',
      'Classification',
    ],
    correctAnswer: 1,
    explanation:
      'Overfitting happens when a model learns the training data too closely, including noise or unnecessary patterns, causing poor performance on new data.',
    topic: 'Overfitting',
    difficulty: 'Medium',
  },
  {
    id: 4,
    question:
      'Which metric is commonly used to measure the accuracy of a classification model?',
    options: [
      'Mean Squared Error',
      'R-squared',
      'Accuracy',
      'Mean Absolute Error',
    ],
    correctAnswer: 2,
    explanation:
      'Accuracy measures the proportion of predictions that the classification model gets correct.',
    topic: 'Evaluation Metrics',
    difficulty: 'Easy',
  },
  {
    id: 5,
    question:
      'What does logistic regression primarily predict?',
    options: [
      'Continuous numerical values',
      'Categories or class probabilities',
      'Only missing values',
      'The number of features',
    ],
    correctAnswer: 1,
    explanation:
      'Logistic regression is commonly used for classification. It estimates the probability that an example belongs to a particular class.',
    topic: 'Logistic Regression',
    difficulty: 'Medium',
  },
];

/* ---------------------------------
   Database status values

   IMPORTANT:
   These MUST match the Supabase
   student_mastery CHECK constraint.
---------------------------------- */

function getMasteryStatus(
  score: number
):
  | 'not_started'
  | 'learning'
  | 'needs_attention'
  | 'mastered' {
  if (score < 40) {
    return 'not_started';
  }

  if (score < 75) {
    return 'needs_attention';
  }

  return 'mastered';
}

/* ---------------------------------
   Component
---------------------------------- */

export function Assessment() {
  const assessments = useAssessments();

  const [filter, setFilter] = useState<
    'all' | 'available' | 'completed'
  >('all');

  const [activeAssessment, setActiveAssessment] =
    useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState<number | null>(null);

  const [answers, setAnswers] =
    useState<Record<number, number>>({});

  const [submitted, setSubmitted] =
    useState(false);

  const [finished, setFinished] =
    useState(false);

  const [score, setScore] =
    useState(0);

  const [saving, setSaving] =
    useState(false);

  const [saveError, setSaveError] =
    useState<string | null>(null);

  /*
   * Keeps the Supabase assessment ID.
   *
   * This is important because if saving fails
   * after the assessment row is created,
   * "Try Saving Again" must reuse the same
   * assessment instead of creating duplicates.
   */
  const [databaseAssessmentId, setDatabaseAssessmentId] =
    useState<string | null>(null);

  /*
   * Keeps the final answers so the retry button
   * can run the save operation again.
   */
  const [finalAnswersForRetry, setFinalAnswersForRetry] =
    useState<Record<number, number> | null>(null);

  const filteredAssessments =
    assessments.filter((assessment) => {
      if (filter === 'all') return true;

      if (filter === 'available') {
        return (
          assessment.status === 'available' ||
          assessment.status === 'in-progress'
        );
      }

      if (filter === 'completed') {
        return assessment.status === 'completed';
      }

      return true;
    });

  const tabs = [
    {
      key: 'all' as const,
      label: 'All',
    },
    {
      key: 'available' as const,
      label: 'Available',
    },
    {
      key: 'completed' as const,
      label: 'Completed',
    },
  ];

  /* ---------------------------------
     Start Assessment
  ---------------------------------- */

  const startAssessment = (
    assessmentId: string
  ) => {
    setActiveAssessment(assessmentId);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setSubmitted(false);
    setFinished(false);
    setScore(0);
    setSaving(false);
    setSaveError(null);
    setDatabaseAssessmentId(null);
    setFinalAnswersForRetry(null);
  };

  /* ---------------------------------
     Submit Current Answer
  ---------------------------------- */

  const submitAnswer = () => {
    if (selectedAnswer === null) return;

    const question =
      quizQuestions[currentQuestion];

    setAnswers((previous) => ({
      ...previous,
      [question.id]: selectedAnswer,
    }));

    setSubmitted(true);
  };

  /* ---------------------------------
     SAVE RESULTS TO SUPABASE
  ---------------------------------- */

  const saveAssessmentResults = async (
    finalAnswers: Record<number, number>,
    finalScore: number
  ) => {
    setSaving(true);
    setSaveError(null);

    try {
      /* -------------------------------
         Get logged-in user
      -------------------------------- */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(
          `Unable to verify login: ${userError.message}`
        );
      }

      if (!user) {
        throw new Error(
          'You are not logged in. Please log in again.'
        );
      }

      /* -------------------------------
         Load topic IDs
      -------------------------------- */

      const topicNames =
        quizQuestions.map(
          (question) => question.topic
        );

      const {
        data: topicData,
        error: topicError,
      } = await supabase
        .from('topics')
        .select('id, name')
        .in('name', topicNames);

      if (topicError) {
        throw new Error(
          `Unable to load ML topics: ${topicError.message}`
        );
      }

      const topicMap = new Map<
        string,
        string
      >();

      (topicData ?? []).forEach((topic) => {
        topicMap.set(topic.name, topic.id);
      });

      const missingTopics =
        topicNames.filter(
          (name) => !topicMap.has(name)
        );

      if (missingTopics.length > 0) {
        throw new Error(
          `These topics were not found in Supabase: ${missingTopics.join(
            ', '
          )}`
        );
      }

      /* -------------------------------
         Calculate score
      -------------------------------- */

      const correctCount =
        quizQuestions.filter(
          (question) =>
            finalAnswers[question.id] ===
            question.correctAnswer
        ).length;

      const startedAt =
        new Date(
          Date.now() -
            5 * 60 * 1000
        ).toISOString();

      const completedAt =
        new Date().toISOString();

      /* -------------------------------
         Create OR reuse assessment
      -------------------------------- */

      let assessmentId =
        databaseAssessmentId;

      if (!assessmentId) {
        const {
          data: assessmentRow,
          error: assessmentError,
        } = await supabase
          .from('assessments')
          .insert({
            student_id: user.id,
            topic_id: null,
            title:
              'Machine Learning Diagnostic Assessment',
            assessment_type: 'diagnostic',
            total_questions:
              quizQuestions.length,
            correct_answers:
              correctCount,
            score: finalScore,
            started_at: startedAt,
            completed_at: completedAt,
            completed: true,
          })
          .select('id')
          .single();

        if (assessmentError) {
          throw new Error(
            `Unable to save assessment: ${assessmentError.message}`
          );
        }

        assessmentId = assessmentRow.id;

        setDatabaseAssessmentId(
          assessmentRow.id
        );
      } else {
        /*
         * Retry path.
         *
         * Reuse the original assessment row.
         */
        const {
          error: updateAssessmentError,
        } = await supabase
          .from('assessments')
          .update({
            correct_answers:
              correctCount,
            score: finalScore,
            completed_at:
              completedAt,
            completed: true,
          })
          .eq('id', assessmentId)
          .eq('student_id', user.id);

        if (updateAssessmentError) {
          throw new Error(
            `Unable to update assessment: ${updateAssessmentError.message}`
          );
        }
      }

      /* -------------------------------
         Save student answers
      -------------------------------- */

      /*
       * Delete answers belonging to this
       * assessment first.
       *
       * This makes the retry safe and prevents
       * duplicate answers.
       */
      const {
        error: deleteAnswersError,
      } = await supabase
        .from('student_answers')
        .delete()
        .eq(
          'assessment_id',
          assessmentId
        )
        .eq(
          'student_id',
          user.id
        );

      if (deleteAnswersError) {
        throw new Error(
          `Unable to prepare student answers: ${deleteAnswersError.message}`
        );
      }

      /*
       * Load actual database questions.
       *
       * The local UI questions use IDs 1-5,
       * while Supabase questions use UUIDs.
       *
       * Therefore we match them by question text.
       */
      const {
        data: dbQuestions,
        error: dbQuestionsError,
      } = await supabase
        .from('questions')
        .select(
          'id, topic_id, question_text'
        );

      if (dbQuestionsError) {
        throw new Error(
          `Unable to check database questions: ${dbQuestionsError.message}`
        );
      }

      const databaseAnswerRows =
        quizQuestions
          .map((question) => {
            const matchingQuestion =
              (dbQuestions ?? []).find(
                (dbQuestion) =>
                  dbQuestion.question_text ===
                  question.question
              );

            if (!matchingQuestion) {
              return null;
            }

            const selected =
              finalAnswers[question.id];

            const isCorrect =
              selected ===
              question.correctAnswer;

            return {
              assessment_id:
                assessmentId,
              question_id:
                matchingQuestion.id,
              student_id:
                user.id,
              answer_text:
                selected !== undefined
                  ? question.options[
                      selected
                    ]
                  : null,
              is_correct:
                isCorrect,
              error_type:
                isCorrect
                  ? null
                  : 'knowledge_gap',
              ai_feedback:
                isCorrect
                  ? 'Correct answer.'
                  : question.explanation,
              answered_at:
                completedAt,
            };
          })
          .filter(
            (
              row
            ): row is NonNullable<
              typeof row
            > =>
              row !== null
          );

      /*
       * Insert matching database answers.
       *
       * If the database does not yet contain
       * these exact questions, we don't fail the
       * whole assessment. Mastery can still be
       * calculated from the local assessment.
       */
      if (
        databaseAnswerRows.length > 0
      ) {
        const {
          error: answerError,
        } = await supabase
          .from('student_answers')
          .insert(
            databaseAnswerRows
          );

        if (answerError) {
          throw new Error(
            `Unable to save student answers: ${answerError.message}`
          );
        }
      }

      /* -------------------------------
         Update student mastery
      -------------------------------- */

      for (const question of quizQuestions) {
        const topicId =
          topicMap.get(question.topic);

        if (!topicId) continue;

        const isCorrect =
          finalAnswers[question.id] ===
          question.correctAnswer;

        /*
         * For the current diagnostic:
         *
         * Correct = 100
         * Wrong   = 0
         */
        const newScore =
          isCorrect ? 100 : 0;

        /* -------------------------------
           Check existing mastery
        -------------------------------- */

        const {
          data: existingMastery,
          error:
            masteryReadError,
        } = await supabase
          .from('student_mastery')
          .select(
            'id, mastery_score, assessment_count, last_assessed_at'
          )
          .eq(
            'student_id',
            user.id
          )
          .eq(
            'topic_id',
            topicId
          )
          .maybeSingle();

        if (masteryReadError) {
          throw new Error(
            `Unable to read mastery for ${question.topic}: ${masteryReadError.message}`
          );
        }

        /* -------------------------------
           Existing mastery
        -------------------------------- */

        if (existingMastery) {
          const oldScore =
            Number(
              existingMastery.mastery_score
            ) || 0;

          const oldCount =
            Number(
              existingMastery.assessment_count
            ) || 0;

          /*
           * If this exact assessment is being
           * retried, don't count it twice.
           */
          const sameAssessment =
            existingMastery.last_assessed_at ===
            completedAt;

          const newCount =
            sameAssessment
              ? oldCount
              : oldCount + 1;

          let newScoreAverage: number;

          if (sameAssessment) {
            /*
             * Retry of the same assessment:
             * simply use its latest result.
             */
            newScoreAverage =
              newScore;
          } else {
            /*
             * New assessment:
             * running average.
             */
            newScoreAverage =
              Math.round(
                (oldScore * oldCount +
                  newScore) /
                  newCount
              );
          }

          const {
            error:
              masteryUpdateError,
          } = await supabase
            .from('student_mastery')
            .update({
              mastery_score:
                newScoreAverage,
              confidence_score:
                newScoreAverage,
              status:
                getMasteryStatus(
                  newScoreAverage
                ),
              assessment_count:
                newCount,
              last_assessed_at:
                completedAt,
              updated_at:
                completedAt,
            })
            .eq(
              'id',
              existingMastery.id
            )
            .eq(
              'student_id',
              user.id
            );

          if (masteryUpdateError) {
            throw new Error(
              `Unable to update mastery for ${question.topic}: ${masteryUpdateError.message}`
            );
          }
        }

        /* -------------------------------
           First mastery record
        -------------------------------- */

        else {
          const {
            error:
              masteryInsertError,
          } = await supabase
            .from('student_mastery')
            .insert({
              student_id:
                user.id,
              topic_id:
                topicId,
              mastery_score:
                newScore,
              confidence_score:
                newScore,
              status:
                getMasteryStatus(
                  newScore
                ),
              assessment_count: 1,
              last_assessed_at:
                completedAt,
            });

          if (masteryInsertError) {
            throw new Error(
              `Unable to create mastery for ${question.topic}: ${masteryInsertError.message}`
            );
          }
        }
      }

      console.log(
        'Assessment successfully saved:',
        {
          assessmentId,
          score: finalScore,
          correctCount,
          totalQuestions:
            quizQuestions.length,
        }
      );
    } catch (error) {
      console.error(
        'Assessment save error:',
        error
      );

      throw error;
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------
     Finish / Next Question
  ---------------------------------- */

  const nextQuestion = async () => {
    if (!submitted) return;

    /*
     * Normal next question.
     */
    if (
      currentQuestion <
      quizQuestions.length - 1
    ) {
      setCurrentQuestion(
        (previous) => previous + 1
      );

      setSelectedAnswer(null);
      setSubmitted(false);

      return;
    }

    /*
     * Final question.
     */

    if (selectedAnswer === null) {
      return;
    }

    const finalAnswers: Record<
      number,
      number
    > = {
      ...answers,
      [quizQuestions[currentQuestion].id]:
        selectedAnswer,
    };

    const correctCount =
      quizQuestions.filter(
        (question) =>
          finalAnswers[question.id] ===
          question.correctAnswer
      ).length;

    const finalScore = Math.round(
      (correctCount /
        quizQuestions.length) *
        100
    );

    setScore(finalScore);
    setFinalAnswersForRetry(
      finalAnswers
    );

    try {
      await saveAssessmentResults(
        finalAnswers,
        finalScore
      );

      setFinished(true);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Unable to save your assessment results.'
      );
    }
  };

  /* ---------------------------------
     Retry Save
  ---------------------------------- */

  const retrySave = async () => {
    if (
      !finalAnswersForRetry ||
      saving
    ) {
      return;
    }

    try {
      await saveAssessmentResults(
        finalAnswersForRetry,
        score
      );

      setSaveError(null);
      setFinished(true);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Unable to save your assessment results.'
      );
    }
  };

  /* ---------------------------------
     Exit Assessment
  ---------------------------------- */

  const exitAssessment = () => {
    if (saving) return;

    setActiveAssessment(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setSubmitted(false);
    setFinished(false);
    setScore(0);
    setSaveError(null);
    setDatabaseAssessmentId(null);
    setFinalAnswersForRetry(null);
  };

  /* ---------------------------------
     Restart Assessment
  ---------------------------------- */

  const restartAssessment = () => {
    if (
      !activeAssessment ||
      saving
    ) {
      return;
    }

    startAssessment(
      activeAssessment
    );
  };

  /* ---------------------------------
     Save Error Screen
  ---------------------------------- */

  if (
    activeAssessment &&
    saveError
  ) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <Card className="p-8 text-center border border-red-200">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-text-primary">
              Results couldn't be saved
            </h1>

            <p className="mt-2 text-text-secondary">
              Your score was calculated, but EchoLearn
              couldn't update your learning profile.
            </p>

            <div className="mt-5 rounded-xl bg-red-50 border border-red-100 p-4 text-left">
              <p className="text-sm text-red-700 break-words">
                {saveError}
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                variant="primary"
                disabled={saving}
                onClick={retrySave}
              >
                {saving ? (
                  <>
                    Saving Results...
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  </>
                ) : (
                  'Try Saving Again'
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ---------------------------------
     Final Result
  ---------------------------------- */

  if (
    activeAssessment &&
    finished
  ) {
    const correctCount =
      Math.round(
        (score / 100) *
          quizQuestions.length
      );

    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <Card className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
              <Trophy className="h-10 w-10 text-indigo-600" />
            </div>

            <h1 className="text-3xl font-bold text-text-primary">
              Assessment Complete!
            </h1>

            <p className="mt-2 text-text-secondary">
              Here's how you performed.
            </p>

            <div className="my-8">
              <div className="text-6xl font-bold text-primary">
                {score}%
              </div>

              <p className="mt-2 text-text-secondary">
                {correctCount} of{' '}
                {quizQuestions.length}{' '}
                questions correct
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-text-secondary">
                  Questions
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {quizQuestions.length}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-text-secondary">
                  Correct
                </p>

                <p className="mt-1 text-xl font-semibold text-success">
                  {correctCount}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-text-secondary">
                  Score
                </p>

                <p className="mt-1 text-xl font-semibold text-primary">
                  {score}%
                </p>
              </div>
            </div>

            <div className="mb-8 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />

                <p className="text-sm font-medium text-emerald-700">
                  Your results have been saved to your
                  EchoLearn learning profile.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={exitAssessment}
              >
                Back to Assessments
              </Button>

              <Button
                variant="primary"
                onClick={
                  restartAssessment
                }
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Assessment
              </Button>

              <Button
                variant="primary"
                onClick={() =>
                  window.location.href =
                    '/gaps'
                }
              >
                View Learning Gaps
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ---------------------------------
     Quiz Screen
  ---------------------------------- */

  if (activeAssessment) {
    const question =
      quizQuestions[currentQuestion];

    const isCorrect =
      selectedAnswer ===
      question.correctAnswer;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            disabled={saving}
            onClick={exitAssessment}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit
          </Button>

          <div className="text-sm font-medium text-text-secondary">
            Question {currentQuestion + 1} of{' '}
            {quizQuestions.length}
          </div>
        </div>

        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{
              width: 0,
            }}
            animate={{
              width: `${
                ((currentQuestion + 1) /
                  quizQuestions.length) *
                100
              }%`,
            }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -20,
            }}
          >
            <Card className="p-6 md:p-8">
              <div className="flex flex-wrap gap-2 mb-5">
                <Badge variant="info">
                  {question.topic}
                </Badge>

                <Badge variant="warning">
                  {question.difficulty}
                </Badge>
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-text-primary leading-relaxed">
                {question.question}
              </h1>

              <div className="mt-7 space-y-3">
                {question.options.map(
                  (option, index) => {
                    const isSelected =
                      selectedAnswer ===
                      index;

                    const isCorrectOption =
                      index ===
                      question.correctAnswer;

                    let optionClass =
                      'border-border hover:border-primary hover:bg-primary/5';

                    if (
                      submitted &&
                      isCorrectOption
                    ) {
                      optionClass =
                        'border-success bg-success/10';
                    } else if (
                      submitted &&
                      isSelected &&
                      !isCorrectOption
                    ) {
                      optionClass =
                        'border-error bg-error/10';
                    } else if (
                      isSelected
                    ) {
                      optionClass =
                        'border-primary bg-primary/5';
                    }

                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={
                          submitted ||
                          saving
                        }
                        onClick={() =>
                          setSelectedAnswer(
                            index
                          )
                        }
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${optionClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                              isSelected
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 text-text-secondary'
                            }`}
                          >
                            {String.fromCharCode(
                              65 + index
                            )}
                          </div>

                          <span className="text-sm md:text-base text-text-primary">
                            {option}
                          </span>

                          {submitted &&
                            isCorrectOption && (
                              <CheckCircle2 className="ml-auto h-5 w-5 text-success shrink-0" />
                            )}

                          {submitted &&
                            isSelected &&
                            !isCorrectOption && (
                              <XCircle className="ml-auto h-5 w-5 text-error shrink-0" />
                            )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>

              {submitted && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: 'auto',
                  }}
                  className={`mt-6 rounded-xl p-4 ${
                    isCorrect
                      ? 'bg-success/10'
                      : 'bg-error/10'
                  }`}
                >
                  <div className="flex gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
                    )}

                    <div>
                      <p className="font-semibold text-text-primary">
                        {isCorrect
                          ? 'Correct!'
                          : 'Not quite right.'}
                      </p>

                      <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="mt-7 flex justify-end">
                {!submitted ? (
                  <Button
                    variant="primary"
                    disabled={
                      selectedAnswer ===
                        null ||
                      saving
                    }
                    onClick={
                      submitAnswer
                    }
                  >
                    Check Answer
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    disabled={saving}
                    onClick={
                      nextQuestion
                    }
                  >
                    {currentQuestion ===
                    quizQuestions.length -
                      1 ? (
                      saving ? (
                        <>
                          Saving Results...
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        </>
                      ) : (
                        'Finish Assessment'
                      )
                    ) : (
                      'Next Question'
                    )}

                    {!saving && (
                      <ArrowRight className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  /* ---------------------------------
     Assessment List
  ---------------------------------- */

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Assessments
        </h1>

        <p className="text-text-secondary mt-1">
          Adaptive quizzes, diagnostics, and practice
        </p>
      </div>

      <div className="flex gap-2 border-b border-border pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() =>
              setFilter(tab.key)
            }
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {filteredAssessments.map(
          (assessment) => (
            <Card
              key={assessment.id}
              hover
              className="flex flex-col p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <Badge
                  variant={
                    typeBadgeVariant[
                      assessment.type
                    ]
                  }
                >
                  {
                    typeLabels[
                      assessment.type
                    ]
                  }
                </Badge>

                {assessment.status ===
                  'completed' && (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-text-primary mb-1">
                {assessment.title}
              </h3>

              <p className="text-sm text-text-secondary mb-5 flex-grow">
                Topic: {assessment.topicName}
              </p>

              <div className="flex items-center gap-4 text-xs text-text-secondary mb-5 bg-slate-50 p-2 rounded-lg">
                <div className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />

                  <span>
                    {assessment.questionsCount}{' '}
                    Questions
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />

                  <span>
                    {assessment.estimatedMinutes}{' '}
                    mins
                  </span>
                </div>
              </div>

              {assessment.status ===
              'completed' ? (
                <div className="flex justify-between items-center px-2">
                  <div className="text-sm">
                    <span className="text-text-secondary mr-1">
                      Score:
                    </span>

                    <span className="font-semibold text-text-primary">
                      {assessment.score}%
                    </span>
                  </div>

                  <div className="text-xs text-text-secondary">
                    {assessment.completedAt
                      ? new Date(
                          assessment.completedAt
                        ).toLocaleDateString()
                      : ''}
                  </div>
                </div>
              ) : (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() =>
                    startAssessment(
                      assessment.id
                    )
                  }
                >
                  Start Assessment
                </Button>
              )}
            </Card>
          )
        )}

        {filteredAssessments.length ===
          0 && (
          <div className="col-span-full py-12 text-center text-text-secondary">
            No assessments found for this
            filter.
          </div>
        )}
      </motion.div>
    </div>
  );
}