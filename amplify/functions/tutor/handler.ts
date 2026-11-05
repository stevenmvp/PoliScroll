import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

interface TutorEvent {
  arguments?: {
    prompt?: string;
    context?: string;
  };
}

const region = process.env.AWS_REGION ?? "us-east-1";
const client = new BedrockRuntimeClient({ region });

// Los perfiles de inferencia de Nova usan prefijo por geografía.
const geo = region.startsWith("eu-") ? "eu" : region.startsWith("ap-") ? "apac" : "us";
const modelId = process.env.BEDROCK_MODEL_ID ?? `${geo}.amazon.nova-lite-v1:0`;

export const handler = async (event: TutorEvent): Promise<{ answer: string }> => {
  const prompt = event.arguments?.prompt?.trim();
  const context = event.arguments?.context?.trim();
  if (!prompt) throw new Error("La pregunta es obligatoria.");

  const response = await client.send(new ConverseCommand({
    modelId,
    system: [{ text: "Eres un tutor académico socrático. Responde siempre en español. Explica con claridad, no inventes fuentes y guía al estudiante con preguntas antes de dar una respuesta final." }],
    messages: [{
      role: "user",
      content: [{ text: context ? `Contexto académico:\n${context}\n\nPregunta:\n${prompt}` : prompt }],
    }],
    inferenceConfig: { temperature: 0.3, maxTokens: 700 },
  }));
  const answer = response.output?.message?.content?.map((part) => part.text ?? "").join("").trim();
  if (!answer) throw new Error("El tutor IA no devolvió una respuesta.");
  return { answer };
};
