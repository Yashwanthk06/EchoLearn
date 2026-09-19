import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Bot,
  CheckCircle2,
  Clock,
  Lock,
  PlayCircle,
  Send,
  Sparkles,
  User,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { mockTopics, mockTopicProgress } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { askOfflineAI, initializeOfflineAI, isOfflineAIReady } from '../agents/offlineAI';

const lessonTitles: Record<string, string[]> = {
  'topic-01': [
    'What is Machine Learning?',
    'Types of Machine Learning',
    'How ML Systems Learn',
    'Real-World ML Applications',
  ],
  'topic-02': [
    'Understanding Features',
    'Understanding Labels',
    'Features vs Labels',
    'Preparing ML Data',
  ],
  'topic-03': [
    'Training Data',
    'Testing Data',
    'Train-Test Split',
    'Data Leakage',
    'Why Data Splitting Matters',
  ],
  'topic-04': [
    'What is Supervised Learning?',
    'Labeled Data',
    'Regression vs Classification',
    'ML Workflow',
  ],
  'topic-05': [
    'What is Regression?',
    'Continuous Predictions',
    'Regression Examples',
    'Regression Models',
  ],
  'topic-06': [
    'What is Classification?',
    'Binary Classification',
    'Multi-Class Classification',
    'Decision Boundaries',
  ],
  'topic-07': [
    'What is Linear Regression?',
    'Fitting a Line',
    'Cost Function',
    'Gradient Descent',
  ],
  'topic-08': [
    'What is Logistic Regression?',
    'The Logistic Function',
    'Probability and Classification',
    'Decision Boundaries',
  ],
  'topic-09': [
    'What are Decision Trees?',
    'Tree Splitting',
    'Choosing Splits',
    'Pruning',
  ],
  'topic-10': [
    'Why Evaluation Metrics Matter',
    'Accuracy',
    'Precision and Recall',
    'F1 Score',
  ],
  'topic-11': [
    'What is a Confusion Matrix?',
    'True Positives and Negatives',
    'False Positives and Negatives',
    'Reading a Confusion Matrix',
  ],
  'topic-12': [
    'What is Overfitting?',
    'Training vs Testing Performance',
    'Detecting Overfitting',
    'Data Leakage',
    'How to Prevent Overfitting',
  ],
  'topic-13': [
    'What is Underfitting?',
    'Simple vs Complex Models',
    'Detecting Underfitting',
    'Improving Model Fit',
  ],
  'topic-14': [
    'Why Regularization?',
    'L1 Regularization',
    'L2 Regularization',
    'Controlling Model Complexity',
  ],
  'topic-15': [
    'What is Cross Validation?',
    'K-Fold Cross Validation',
    'Stratified Cross Validation',
    'Choosing a Validation Strategy',
  ],
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function TopicLearning() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const topic = mockTopics.find((item) => item.id === topicId);
  const progress = mockTopicProgress.find(
    (item) => item.topicId === topicId
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [tutorError, setTutorError] = useState('');

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-text-primary">
          Topic not found
        </h1>

        <p className="text-text-secondary mt-2">
          The requested learning module does not exist.
        </p>

        <Button
          className="mt-6"
          onClick={() => navigate('/learn')}
        >
          Back to Learn
        </Button>
      </div>
    );
  }

  /*
   * Store the validated topic in a constant.
   * This prevents TypeScript from treating topic as possibly undefined
   * inside the nested sendMessage function.
   */
  const selectedTopic = topic;

  const lessons = lessonTitles[selectedTopic.id] ?? [];
  const completedLessons = progress?.lessonsCompleted ?? 0;
  const mastery = progress?.masteryPercentage ?? 0;

  const prerequisiteNames = selectedTopic.prerequisites
    .map(
      (id) =>
        mockTopics.find((item) => item.id === id)?.name
    )
    .filter(Boolean);

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();

    const message = input.trim();

    if (!message || sending) return;

    setTutorError('');

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setSending(true);

    try {
      /*
       * EchoLearn has two tutor modes:
       *
       * ONLINE  -> Supabase Edge Function / Qwen
       * OFFLINE -> WebLLM running locally in the browser
       *
       * This means the tutor does not depend completely
       * on an internet connection.
       */

      let reply = '';

      if (!navigator.onLine) {
        /*
         * OFFLINE MODE
         */
        if (!isOfflineAIReady()) {
          await initializeOfflineAI();
        }

        reply = await askOfflineAI(
          message,
          `
Subject: Machine Learning
Current topic: ${selectedTopic.name}
Topic description: ${selectedTopic.description}
Student mastery: ${mastery}%
Previous conversation:
${messages
  .slice(-8)
  .map((m) => `${m.role}: ${m.content}`)
  .join('\n')}
          `
        );
      } else {
        /*
         * ONLINE MODE
         */
        const { data, error } =
          await supabase.functions.invoke('ai-tutor', {
            body: {
              topic: selectedTopic.name,
              topicDescription: selectedTopic.description,
              message,
              history: messages.slice(-8),
            },
          });

        if (error) {
          throw new Error(error.message);
        }

        if (!data?.reply) {
          const backendError =
            data?.error || 'The AI tutor returned no response.';

          const details = data?.details
            ? `\n${data.details}`
            : '';

          throw new Error(`${backendError}${details}`);
        }

        reply = data.reply;
      }

      if (!reply.trim()) {
        throw new Error(
          'EchoTutor could not generate a response.'
        );
      }

      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: reply,
        },
      ]);
    } catch (error) {
      console.error('EchoTutor error:', error);

      setTutorError(
        error instanceof Error
          ? error.message
          : 'Unable to reach EchoTutor right now.'
      );
    } finally {
      setSending(false);
    }
  }
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/learn')}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Learn
      </button>

      {/* Topic Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          <div className="p-6 lg:p-8 bg-gradient-to-r from-indigo-50 to-cyan-50">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant={progress?.masteryLevel ?? 'novice'}
                  >
                    {progress?.masteryLevel ?? 'novice'}
                  </Badge>

                  <span className="text-sm text-text-secondary">
                    Module {selectedTopic.order} of 15
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-text-primary">
                  {selectedTopic.name}
                </h1>

                <p className="mt-3 text-text-secondary leading-relaxed">
                  {selectedTopic.description}
                </p>

                <div className="flex flex-wrap gap-4 mt-5 text-sm text-text-secondary">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {selectedTopic.lessonsCount} lessons
                  </span>

                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {selectedTopic.estimatedHours} hours
                  </span>
                </div>
              </div>

              <div className="w-full lg:w-56">
                <div className="text-sm text-text-secondary mb-2">
                  Your mastery
                </div>

                <div className="text-3xl font-bold text-text-primary mb-3">
                  {mastery}%
                </div>

                <ProgressBar value={mastery} />

                <div className="text-xs text-text-secondary mt-2">
                  {completedLessons} of{' '}
                  {selectedTopic.lessonsCount} lessons completed
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Learning Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Lessons */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-text-primary">
              Learning path
            </h2>

            <p className="text-sm text-text-secondary mt-1">
              Learn step-by-step with EchoTutor.
            </p>
          </div>

          <div className="space-y-3">
            {lessons.map((lesson, index) => {
              const lessonNumber = index + 1;
              const isCompleted =
                lessonNumber <= completedLessons;
              const isCurrent =
                lessonNumber === completedLessons + 1;
              const isLocked =
                lessonNumber > completedLessons + 1;

              return (
                <motion.div
                  key={lesson}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    hover={!isLocked}
                    className={`p-4 ${
                      isCurrent
                        ? 'border-indigo-200 bg-indigo-50/40'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-600'
                            : isCurrent
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : isLocked ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <PlayCircle className="h-5 w-5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-text-secondary">
                          Lesson {lessonNumber}
                        </div>

                        <div className="font-semibold text-sm text-text-primary mt-0.5">
                          {lesson}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* EchoTutor */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden h-full min-h-[620px] flex flex-col">
            {/* Tutor Header */}
            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-cyan-50">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-sm">
                  <Bot className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-text-primary">
                      EchoTutor
                    </h2>

                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      AI Tutor
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary mt-0.5">
                    Adaptive learning for {selectedTopic.name}
                  </p>
                </div>

                <Sparkles className="h-5 w-5 text-indigo-500" />
              </div>
            </div>

            {/* Chat */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <div className="h-14 w-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Bot className="h-7 w-7" />
                  </div>

                  <h3 className="font-semibold text-text-primary mt-4">
                    Let's understand {selectedTopic.name}
                  </h3>

                  <p className="text-sm text-text-secondary max-w-md mx-auto mt-2 leading-relaxed">
                    I won't just give you the answer. I'll first
                    understand what you know, identify gaps, and adapt
                    the explanation to you.
                  </p>

                  <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left">
                    <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                      EchoTutor asks
                    </div>

                    <p className="text-sm font-medium text-text-primary mt-2">
                      What do you already understand about{' '}
                      {selectedTopic.name}?
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <motion.div
                  key={`${message.role}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${
                    message.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-md'
                        : 'bg-slate-100 text-text-primary rounded-bl-md'
                    }`}
                  >
                    {message.content}
                  </div>

                  {message.role === 'user' && (
                    <div className="h-8 w-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}

              {sending && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>

                  <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              {tutorError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 whitespace-pre-wrap">
                  {tutorError}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={sendMessage}
              className="p-4 border-t border-slate-200 bg-white"
            >
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder={`Ask EchoTutor about ${selectedTopic.name}...`}
                  rows={2}
                  disabled={sending}
                  className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="h-11 w-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              <p className="text-[11px] text-text-secondary mt-2">
                EchoTutor uses Qwen to adapt explanations to your
                understanding.
              </p>
            </form>
          </Card>
        </div>
      </div>

      {/* Prerequisites */}
      {prerequisiteNames.length > 0 && (
        <Card className="p-5">
          <h2 className="font-semibold text-text-primary">
            Recommended prerequisites
          </h2>

          <div className="flex flex-wrap gap-2 mt-3">
            {prerequisiteNames.map((name) => (
              <Badge key={name} variant="developing">
                {name}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

