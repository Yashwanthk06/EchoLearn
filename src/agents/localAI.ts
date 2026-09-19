import {
  CreateMLCEngine,
  type MLCEngine,
} from '@mlc-ai/web-llm';

let engine: MLCEngine | null = null;

let loadingPromise: Promise<MLCEngine> | null = null;

/*
 * Start with a small model.
 *
 * We will benchmark this on your Iris Xe + 16 GB RAM
 * before deciding whether to move to a larger model.
 */
const MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';

export async function initializeLocalAI(
  onProgress?: (progress: number) => void
): Promise<MLCEngine> {

  if (engine) {
    return engine;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = CreateMLCEngine(
    MODEL,
    {
      initProgressCallback: (progress) => {
        onProgress?.(progress.progress);
      },
    }
  );

  try {
    engine = await loadingPromise;
    return engine;
  } finally {
    loadingPromise = null;
  }
}

export function isLocalAIReady(): boolean {
  return engine !== null;
}

export async function askLocalAI(
  prompt: string
): Promise<string> {

  const ai = await initializeLocalAI();

  const response =
    await ai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `
You are EchoLearn Offline AI Tutor.

You are specialized in Machine Learning.

Your job is to:
- explain ML concepts clearly
- generate ML questions
- evaluate student answers
- identify misconceptions
- provide hints
- recommend appropriate difficulty

Stay focused on Machine Learning.
Do not invent facts when you are uncertain.
Keep answers appropriate for a college student.
          `.trim(),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

  return (
    response.choices[0]?.message?.content ??
    'Unable to generate a response.'
  );
}

export async function generateQuestion(
  topic: string,
  difficulty: string
): Promise<string> {

  return askLocalAI(`
Generate ONE Machine Learning assessment question.

Topic: ${topic}
Difficulty: ${difficulty}

Return only:
QUESTION:
<question>

Do not provide the answer.
  `.trim());
}

export async function evaluateAnswer(
  question: string,
  studentAnswer: string
): Promise<string> {

  return askLocalAI(`
Evaluate this student's Machine Learning answer.

QUESTION:
${question}

STUDENT ANSWER:
${studentAnswer}

Return:
CORRECTNESS: Correct / Partially Correct / Incorrect
FEEDBACK: <short explanation>
MISCONCEPTION: <main misconception or "None">
  `.trim());
}
