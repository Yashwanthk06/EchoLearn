import * as webllm from '@mlc-ai/web-llm';
import { buildKnowledgeContext } from './retrievalEngine';

let engine: webllm.MLCEngine | null = null;
let loading = false;
let loadingProgress = 0;

const MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';

const OFFLINE_AI_PREPARED_KEY =
  'echolearn_offline_ai_prepared';

/**
 * Checks whether Offline AI was successfully prepared
 * during a previous browser session.
 */
export function isOfflineAIPrepared(): boolean {
  try {
    return (
      localStorage.getItem(
        OFFLINE_AI_PREPARED_KEY
      ) === 'true'
    );
  } catch {
    return false;
  }
}

/**
 * Marks Offline AI as prepared.
 */
function markOfflineAIPrepared(): void {
  try {
    localStorage.setItem(
      OFFLINE_AI_PREPARED_KEY,
      'true'
    );
  } catch {
    // Ignore localStorage errors.
  }
}

/**
 * Clears the prepared marker.
 *
 * This should only happen if restoring the cached
 * model actually fails.
 */
export function clearOfflineAIPrepared(): void {
  try {
    localStorage.removeItem(
      OFFLINE_AI_PREPARED_KEY
    );
  } catch {
    // Ignore localStorage errors.
  }
}

/**
 * Initializes the WebLLM model.
 *
 * First time:
 * Internet → download → browser cache → load
 *
 * Later:
 * Browser cache → load
 */
export async function initializeOfflineAI(
  onProgress?: (progress: number) => void
): Promise<webllm.MLCEngine> {
  if (engine) {
    onProgress?.(1);
    return engine;
  }

  if (loading) {
    throw new Error(
      'Offline AI is already being initialized.'
    );
  }

  loading = true;
  loadingProgress = 0;

  try {
    engine = await webllm.CreateMLCEngine(
      MODEL,
      {
        initProgressCallback: (progress) => {
          loadingProgress = progress.progress;
          onProgress?.(progress.progress);
        },
      }
    );

    /*
     * If initialization succeeds, the model is now
     * available and WebLLM has its cached copy.
     */
    markOfflineAIPrepared();

    loadingProgress = 1;
    onProgress?.(1);

    return engine;
  } catch (error) {
    engine = null;

    /*
     * Only remove the prepared marker if initialization
     * genuinely failed.
     */
    clearOfflineAIPrepared();

    throw error;
  } finally {
    loading = false;
  }
}

/**
 * Returns true if the model is loaded and usable
 * in the current browser page.
 */
export function isOfflineAIReady(): boolean {
  return engine !== null;
}

/**
 * Returns true if WebLLM is currently loading.
 */
export function isOfflineAILoading(): boolean {
  return loading;
}

/**
 * Returns loading progress from 0 to 1.
 */
export function getOfflineAIProgress(): number {
  return loadingProgress;
}

/**
 * First-time preparation.
 *
 * Requires internet because the model may need to
 * be downloaded and cached.
 */
export async function prepareOfflineAI(
  onProgress?: (progress: number) => void
): Promise<void> {
  if (engine) {
    onProgress?.(1);
    return;
  }

  if (!navigator.onLine) {
    throw new Error(
      'Internet connection is required the first time Offline AI is prepared.'
    );
  }

  await initializeOfflineAI(onProgress);
}

/**
 * Restores Offline AI after a page refresh.
 *
 * If the preparation marker exists, WebLLM attempts
 * to load the already cached model.
 *
 * It does NOT intentionally download the model again.
 */
export async function restoreOfflineAI(
  onProgress?: (progress: number) => void
): Promise<boolean> {
  if (engine) {
    onProgress?.(1);
    return true;
  }

  if (!isOfflineAIPrepared()) {
    return false;
  }

  try {
    await initializeOfflineAI(onProgress);

    return true;
  } catch (error) {
    console.warn(
      'Cached Offline AI could not be restored.',
      error
    );

    engine = null;
    clearOfflineAIPrepared();

    return false;
  }
}

/**
 * Ask EchoTutor using the locally loaded model.
 */
export async function askOfflineAI(
  question: string,
  context?: string
): Promise<string> {
  if (!engine) {
    throw new Error(
      'Offline AI is not ready. Prepare Offline AI while connected to the internet first.'
    );
  }

  const knowledgeContext =
    buildKnowledgeContext(question, 4);

  const systemPrompt = `
You are EchoTutor, the offline AI tutor inside EchoLearn.

You are specialized in teaching Machine Learning.

IMPORTANT:

- You are NOT a fixed question-and-answer system.
- Students can ask arbitrary natural-language questions.
- Generate explanations dynamically.
- Generate original examples.
- Generate original practice questions.
- Adapt explanations to the student's level.
- Explain WHY an answer is correct or incorrect.
- Identify misconceptions.
- Use the EchoLearn knowledge below as the primary curriculum.
- Do not pretend the knowledge base is a fixed question bank.
- If something is outside the loaded curriculum, clearly say so.
- Never invent that a particular question was previously stored.

Student context:
${context || 'No additional student context available.'}

Relevant EchoLearn Machine Learning knowledge:
${knowledgeContext}

Answer naturally and teach the student rather than simply
dumping an answer.
`;

  const response =
    await engine.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.7,
      max_tokens: 512,
    });

  return (
    response.choices[0]?.message?.content?.trim() || ''
  );
}