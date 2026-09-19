import * as webllm from "@mlc-ai/web-llm";

let engine: webllm.MLCEngine | null = null;

let loading = false;

export async function initOfflineAI(
  onProgress?: (progress: number, text: string) => void
) {
  if (engine) return engine;
  if (loading) return null;

  loading = true;

  try {
    const selectedModel = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

    engine = await webllm.CreateMLCEngine(
      selectedModel,
      {
        initProgressCallback: (progress) => {
          const percent = Math.round(progress.progress * 100);

          onProgress?.(
            percent,
            progress.text || "Loading offline AI..."
          );
        },
      }
    );

    return engine;
  } finally {
    loading = false;
  }
}

export async function askOfflineAI(
  question: string,
  context?: string
): Promise<string> {
  if (!engine) {
    throw new Error(
      "Offline AI is not initialized yet."
    );
  }

  const systemPrompt = `
You are EchoLearn Offline Tutor.

You are an AI tutor for the Machine Learning subject.

Your job is to:
- Explain Machine Learning concepts clearly.
- Answer student questions.
- Give examples.
- Explain code when asked.
- Identify misunderstandings.
- Ask follow-up questions when useful.
- Adapt explanations to the student's level.
- Never pretend that a fixed answer is correct if the question is unclear.

You are running completely offline in the student's browser.

Relevant learning context:
${context || "No additional context available."}
`;

  const response = await engine.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: question,
      },
    ],
    temperature: 0.7,
    max_tokens: 512,
  });

  return (
    response.choices[0]?.message?.content ||
    "I couldn't generate an answer."
  );
}

export function isOfflineAIReady(): boolean {
  return engine !== null;
}

export function stopOfflineAI() {
  if (engine) {
    engine.unload();
    engine = null;
  }
}
