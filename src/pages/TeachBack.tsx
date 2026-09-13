import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Type,
  Send,
  Bot,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressRing } from '../components/ui/ProgressRing';
import { supabase } from '../lib/supabase';

type TeachBackQuestion = {
  id: string;
  topicName: string;
  prompt: string;
};

type Evaluation = {
  score: number;
  feedback: string;
  strengths: string[];
  missingConcepts: string[];
};

/* =========================================
   SPEECH RECOGNITION TYPES
========================================= */

interface SpeechRecognitionResultItem {
  transcript: string;
  confidence?: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResults {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResults;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;

  start: () => void;
  stop: () => void;
  abort: () => void;

  onstart: (() => void) | null;

  onresult:
    | ((event: SpeechRecognitionEventLike) => void)
    | null;

  onend: (() => void) | null;

  onerror:
    | ((event: SpeechRecognitionErrorEvent) => void)
    | null;
}

type SpeechRecognitionConstructor =
  new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

/* =========================================
   QUESTIONS
========================================= */

const teachBackQuestions: TeachBackQuestion[] = [
  {
    id: 'tb-1',
    topicName: 'ML Fundamentals',
    prompt:
      'Explain what Machine Learning is in your own words.',
  },
  {
    id: 'tb-2',
    topicName: 'Features and Labels',
    prompt:
      'Explain the difference between a feature and a label using a simple example.',
  },
  {
    id: 'tb-3',
    topicName: 'Training and Testing Data',
    prompt:
      'Explain why we split a dataset into training data and testing data.',
  },
  {
    id: 'tb-4',
    topicName: 'Supervised Learning',
    prompt:
      'Explain supervised learning and give one real-world example.',
  },
  {
    id: 'tb-5',
    topicName: 'Regression',
    prompt:
      'Explain what regression means in Machine Learning.',
  },
  {
    id: 'tb-6',
    topicName: 'Classification',
    prompt:
      'Explain classification and give an example of a classification problem.',
  },
  {
    id: 'tb-7',
    topicName: 'Linear Regression',
    prompt:
      'Explain how Linear Regression makes predictions.',
  },
  {
    id: 'tb-8',
    topicName: 'Logistic Regression',
    prompt:
      'Explain what Logistic Regression is used for and how it differs from Linear Regression.',
  },
  {
    id: 'tb-9',
    topicName: 'Overfitting',
    prompt:
      'Explain overfitting and why it can cause poor performance on new data.',
  },
  {
    id: 'tb-10',
    topicName: 'Confusion Matrix',
    prompt:
      'Explain what a confusion matrix tells us about a classification model.',
  },
];

/* =========================================
   COMPONENT
========================================= */

export function TeachBack() {
  const [responses, setResponses] = useState<
    Record<string, string>
  >({});

  const [evaluations, setEvaluations] = useState<
    Record<string, Evaluation>
  >({});

  const [evaluating, setEvaluating] = useState<
    Record<string, boolean>
  >({});

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [recordingQuestion, setRecordingQuestion] =
    useState<string | null>(null);

  const recognitionRef =
    useRef<SpeechRecognitionLike | null>(null);

  /*
   * Text that existed before voice recording started.
   */
  const voiceStartingTextRef = useRef('');

  /*
   * Stores finalized speech by browser result index.
   *
   * This is the important fix.
   *
   * Instead of APPENDING every browser event,
   * we store each result once.
   */
  const finalizedResultsRef = useRef<
    Record<number, string>
  >({});

  /*
   * Current interim speech.
   */
  const interimResultRef = useRef('');

  /* =========================================
     TEXT RESPONSE
  ========================================= */

  const updateResponse = (
    questionId: string,
    value: string
  ) => {
    setResponses((previous) => ({
      ...previous,
      [questionId]: value,
    }));

    /*
     * If the student edits the answer,
     * previous AI evaluation is no longer valid.
     */
    setEvaluations((previous) => {
      const updated = { ...previous };
      delete updated[questionId];
      return updated;
    });

    setErrors((previous) => {
      const updated = { ...previous };
      delete updated[questionId];
      return updated;
    });
  };

  /* =========================================
     START VOICE
  ========================================= */

  const startVoiceResponse = (
    questionId: string
  ) => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrors((previous) => ({
        ...previous,
        [questionId]:
          'Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.',
      }));

      return;
    }

    /*
     * Stop previous recognition if necessary.
     */
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }

      recognitionRef.current = null;
    }

    /*
     * Create fresh recognition.
     */
    const recognition = new SpeechRecognition();

    /*
     * We intentionally use FALSE.
     *
     * The user speaks one answer and then pauses.
     * This makes the demo much more stable.
     */
    recognition.continuous = false;

    /*
     * We still want live text while speaking.
     */
    recognition.interimResults = true;

    /*
     * Indian English.
     */
    recognition.lang = 'en-IN';

    recognitionRef.current = recognition;

    /*
     * Save whatever was already typed.
     */
    voiceStartingTextRef.current =
      responses[questionId] ?? '';

    /*
     * Clear previous speech results.
     */
    finalizedResultsRef.current = {};

    interimResultRef.current = '';

    setRecordingQuestion(questionId);

    setErrors((previous) => {
      const updated = { ...previous };
      delete updated[questionId];
      return updated;
    });

    recognition.onstart = () => {
      setRecordingQuestion(questionId);
    };

    /* =========================================
       SPEECH RESULT
    ========================================= */

    recognition.onresult = (
      event: SpeechRecognitionEventLike
    ) => {
      /*
       * Read EVERY current result from the browser.
       *
       * We do NOT append blindly.
       */
      let currentInterim = '';

      for (
        let i = 0;
        i < event.results.length;
        i++
      ) {
        const result = event.results[i];

        if (!result) {
          continue;
        }

        const transcript =
          result[0]?.transcript?.trim() ?? '';

        if (!transcript) {
          continue;
        }

        if (result.isFinal) {
          /*
           * Store this result using its index.
           *
           * If Chrome sends the same result again,
           * it simply OVERWRITES the same index.
           *
           * Therefore:
           *
           * "machine learning"
           *
           * cannot become:
           *
           * "machine learning machine learning"
           */
          finalizedResultsRef.current[i] =
            transcript;
        } else {
          /*
           * Interim text is temporary.
           *
           * Replace it instead of appending it.
           */
          currentInterim +=
            `${transcript} `;
        }
      }

      interimResultRef.current =
        currentInterim.trim();

      /*
       * Build final speech from stored results.
       */
      const finalizedText = Object.keys(
        finalizedResultsRef.current
      )
        .sort(
          (a, b) =>
            Number(a) - Number(b)
        )
        .map(
          (index) =>
            finalizedResultsRef.current[
              Number(index)
            ]
        )
        .join(' ');

      /*
       * Combine:
       *
       * existing typed text
       * +
       * finalized speech
       * +
       * current interim speech
       */
      const combined = [
        voiceStartingTextRef.current,
        finalizedText,
        interimResultRef.current,
      ]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      setResponses((previous) => ({
        ...previous,
        [questionId]: combined,
      }));
    };

    /* =========================================
       END
    ========================================= */

    recognition.onend = () => {
  /*
   * Chrome can automatically stop Speech Recognition
   * even though the student is still speaking.
   *
   * If the student has NOT pressed Stop Recording,
   * immediately start a new recognition session.
   */

  if (recordingQuestion === questionId) {
    try {
      recognition.start();
      return;
    } catch {
      // Chrome may briefly reject restart.
      // We handle this below.
    }
  }

  setRecordingQuestion(null);

  if (recognitionRef.current === recognition) {
    recognitionRef.current = null;
  }
};
    recognition.onerror = (event) => {
      console.error(
        'Speech recognition error:',
        event.error
      );

      setRecordingQuestion(null);

      if (
        recognitionRef.current ===
        recognition
      ) {
        recognitionRef.current = null;
      }

      /*
       * "aborted" happens when we intentionally stop it.
       */
      if (event.error === 'aborted') {
        return;
      }

      let message =
        'Could not access voice input. Please try again.';

      if (event.error === 'not-allowed') {
        message =
          'Microphone permission was denied. Please allow microphone access in your browser.';
      }

      if (event.error === 'no-speech') {
        message =
          'No speech was detected. Please try again.';
      }

      if (event.error === 'audio-capture') {
        message =
          'No microphone was detected. Please check your microphone.';
      }

      setErrors((previous) => ({
        ...previous,
        [questionId]: message,
      }));
    };

    /*
     * Start microphone.
     */
    try {
      recognition.start();
    } catch (error) {
      console.error(
        'Speech recognition start error:',
        error
      );

      setRecordingQuestion(null);
      recognitionRef.current = null;
    }
  };

  /* =========================================
     STOP VOICE
  ========================================= */

  const stopVoiceResponse = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }

    setRecordingQuestion(null);
  };

  /* =========================================
     GEMINI EVALUATION
  ========================================= */

  const submitTeachBack = async (
    question: TeachBackQuestion
  ) => {
    const studentResponse =
      responses[question.id]?.trim() ?? '';

    if (studentResponse.length < 10) {
      setErrors((previous) => ({
        ...previous,
        [question.id]:
          'Please give a little more explanation before submitting.',
      }));

      return;
    }

    setEvaluating((previous) => ({
      ...previous,
      [question.id]: true,
    }));

    setErrors((previous) => {
      const updated = { ...previous };
      delete updated[question.id];
      return updated;
    });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          'Your session has expired. Please log in again.'
        );
      }

      const { data, error } =
        await supabase.functions.invoke(
          'ai-tutor',
          {
            body: {
              topic: question.topicName,

              message: `
Evaluate this student's Teach Back explanation.

Concept:
${question.topicName}

Question:
${question.prompt}

Student's explanation:
${studentResponse}

Return ONLY valid JSON:

{
  "score": 0,
  "feedback": "short helpful feedback",
  "strengths": ["strength 1", "strength 2"],
  "missingConcepts": ["missing concept 1"]
}

Rules:
- Score must be an integer from 0 to 100.
- Be fair and educational.
- Identify what the student understood.
- Identify important concepts they missed.
- Detect misconceptions.
- Keep feedback concise and encouraging.
- Do not use markdown.
              `,

              history: [],
            },
          }
        );

      if (error) {
        throw error;
      }

      const reply = data?.reply;

      if (!reply) {
        throw new Error(
          'The AI returned an empty response.'
        );
      }

      /*
       * Remove markdown code fences if Gemini adds them.
       */
      const cleanedReply = reply
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      let parsed: Evaluation;

      try {
        parsed = JSON.parse(cleanedReply);
      } catch {
        parsed = {
          score: 70,
          feedback: reply,
          strengths: [
            'You explained the concept in your own words.',
          ],
          missingConcepts: [],
        };
      }

      parsed.score = Math.max(
        0,
        Math.min(
          100,
          Number(parsed.score) || 0
        )
      );

      parsed.strengths = Array.isArray(
        parsed.strengths
      )
        ? parsed.strengths
        : [];

      parsed.missingConcepts =
        Array.isArray(
          parsed.missingConcepts
        )
          ? parsed.missingConcepts
          : [];

      setEvaluations((previous) => ({
        ...previous,
        [question.id]: parsed,
      }));
    } catch (error) {
      console.error(
        'Teach Back evaluation error:',
        error
      );

      setErrors((previous) => ({
        ...previous,
        [question.id]:
          error instanceof Error
            ? error.message
            : 'Unable to evaluate your response.',
      }));
    } finally {
      setEvaluating((previous) => ({
        ...previous,
        [question.id]: false,
      }));
    }
  };

  /* =========================================
     PROGRESS
  ========================================= */

  const completedCount =
    Object.keys(evaluations).length;

  const progress =
    (completedCount /
      teachBackQuestions.length) *
    100;

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">

      {/* Header */}

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-text-primary">
            Teach Back
          </h1>

          <Sparkles className="h-5 w-5 text-primary" />
        </div>

        <p className="text-text-secondary mt-1">
          Explain concepts in your own words and let
          EchoTutor check your understanding.
        </p>
      </div>


      {/* Progress */}

      <Card className="p-5">
        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-text-secondary">
              Teach Back Progress
            </p>

            <p className="text-xl font-bold text-text-primary mt-1">
              {completedCount} /{' '}
              {teachBackQuestions.length}
            </p>

            <p className="text-xs text-text-secondary mt-1">
              Complete each explanation to build your
              learning profile.
            </p>
          </div>

          <ProgressRing
            value={progress}
            size={60}
            strokeWidth={6}
          >
            <span className="text-xs font-bold">
              {Math.round(progress)}%
            </span>
          </ProgressRing>

        </div>
      </Card>


      {/* Questions */}

      <div className="space-y-6">

        {teachBackQuestions.map(
          (question, index) => {

            const response =
              responses[question.id] ?? '';

            const evaluation =
              evaluations[question.id];

            const isEvaluating =
              evaluating[question.id] ?? false;

            const error =
              errors[question.id];

            const isRecording =
              recordingQuestion ===
              question.id;

            return (
              <motion.div
                key={question.id}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.04,
                }}
              >

                <Card
                  className={`p-5 border-l-4 ${
                    evaluation
                      ? 'border-l-emerald-500'
                      : isRecording
                      ? 'border-l-red-500'
                      : 'border-l-amber-500'
                  }`}
                >

                  {/* Question */}

                  <div className="mb-4">

                    <div className="flex items-center justify-between gap-3">

                      <Badge variant="warning">
                        {question.topicName}
                      </Badge>

                      <span className="text-xs text-text-secondary">
                        Question {index + 1} of{' '}
                        {teachBackQuestions.length}
                      </span>

                    </div>

                    <h3 className="text-lg font-medium text-text-primary mt-3 leading-relaxed">
                      {question.prompt}
                    </h3>

                  </div>


                  {/* Recording indicator */}

                  {isRecording && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -5,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-red-50 border border-red-200 p-3"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex gap-1">
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse [animation-delay:150ms]" />
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse [animation-delay:300ms]" />
                        </div>

                        <span className="text-sm font-medium text-red-700">
                          Listening... Speak your answer
                        </span>

                      </div>

                      <span className="text-xs text-red-600">
                        Pause when finished
                      </span>

                    </motion.div>
                  )}


                  {/* Response */}

                  <textarea
                    className="w-full border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-white"
                    rows={5}
                    placeholder="Type your explanation or use Voice Response..."
                    value={response}
                    onChange={(event) =>
                      updateResponse(
                        question.id,
                        event.target.value
                      )
                    }
                    disabled={isEvaluating}
                  />


                  {/* Actions */}

                  <div className="flex gap-3 flex-wrap mt-4">

                    {/* Type */}

                    <Button
                      variant="secondary"
                      size="sm"
                      icon={
                        <Type className="h-4 w-4" />
                      }
                      disabled={isEvaluating}
                    >
                      Type Response
                    </Button>


                    {/* Voice */}

                    {isRecording ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={
                          <MicOff className="h-4 w-4" />
                        }
                        onClick={
                          stopVoiceResponse
                        }
                      >
                        Stop Recording
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={
                          <Mic className="h-4 w-4" />
                        }
                        disabled={isEvaluating}
                        onClick={() =>
                          startVoiceResponse(
                            question.id
                          )
                        }
                      >
                        Voice Response
                      </Button>
                    )}


                    <div className="flex-1" />


                    {/* Submit */}

                    <Button
                      variant="primary"
                      size="sm"
                      icon={
                        isEvaluating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )
                      }
                      disabled={
                        response.trim().length <
                          10 ||
                        isEvaluating ||
                        isRecording
                      }
                      onClick={() =>
                        submitTeachBack(
                          question
                        )
                      }
                    >
                      {isEvaluating
                        ? 'Analyzing...'
                        : evaluation
                        ? 'Re-evaluate'
                        : 'Submit'}
                    </Button>

                  </div>


                  {/* Error */}

                  {error && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 5,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mt-5 rounded-xl bg-red-50 border border-red-200 p-4"
                    >

                      <div className="flex gap-3">

                        <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />

                        <div>

                          <p className="font-semibold text-red-800 text-sm">
                            Something went wrong
                          </p>

                          <p className="text-sm text-red-700 mt-1">
                            {error}
                          </p>

                        </div>

                      </div>

                    </motion.div>
                  )}


                  {/* AI Evaluation */}

                  {evaluation && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mt-6"
                    >

                      <Card className="bg-gradient-to-r from-cyan-50/50 to-white border-l-4 border-l-cyan-500 p-5">

                        <div className="flex items-start gap-5">

                          {/* Score */}

                          <div className="shrink-0">
                            <ProgressRing
                              value={
                                evaluation.score
                              }
                              size={70}
                              strokeWidth={6}
                            >
                              <span className="text-base font-bold">
                                {
                                  evaluation.score
                                }
                              </span>
                            </ProgressRing>
                          </div>


                          {/* Evaluation */}

                          <div className="flex-1">

                            <div className="flex items-center gap-2 mb-2">

                              <Bot className="h-5 w-5 text-cyan-600" />

                              <h4 className="font-semibold text-cyan-900">
                                EchoTutor Evaluation
                              </h4>

                            </div>


                            <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                              {
                                evaluation.feedback
                              }
                            </p>


                            {/* Strengths */}

                            {evaluation
                              .strengths
                              .length > 0 && (
                              <div className="mb-4">

                                <span className="text-xs font-medium text-slate-500">
                                  What you understood
                                </span>

                                <div className="flex flex-wrap gap-2 mt-2">

                                  {evaluation.strengths.map(
                                    (
                                      strength,
                                      strengthIndex
                                    ) => (
                                      <Badge
                                        key={
                                          strengthIndex
                                        }
                                        variant="success"
                                      >
                                        <Check className="h-3 w-3 inline mr-1" />
                                        {strength}
                                      </Badge>
                                    )
                                  )}

                                </div>

                              </div>
                            )}


                            {/* Missing concepts */}

                            {evaluation
                              .missingConcepts
                              .length > 0 && (
                              <div>

                                <span className="text-xs font-medium text-slate-500">
                                  Concepts to review
                                </span>

                                <div className="flex flex-wrap gap-2 mt-2">

                                  {evaluation.missingConcepts.map(
                                    (
                                      concept,
                                      conceptIndex
                                    ) => (
                                      <Badge
                                        key={
                                          conceptIndex
                                        }
                                        variant="warning"
                                      >
                                        <AlertCircle className="h-3 w-3 inline mr-1" />
                                        {concept}
                                      </Badge>
                                    )
                                  )}

                                </div>

                              </div>
                            )}

                          </div>

                        </div>

                      </Card>

                    </motion.div>
                  )}

                </Card>

              </motion.div>
            );
          }
        )}

      </div>

    </div>
  );
}