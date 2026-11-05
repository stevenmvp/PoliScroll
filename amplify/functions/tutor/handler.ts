import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

interface TutorEvent {
  arguments?: {
    prompt?: string;
    context?: string;
  };
}

// Bedrock se invoca siempre en us-east-1 con el perfil de inferencia "us.", sin configuración adicional.
const client = new BedrockRuntimeClient({ region: "us-east-1" });
const modelId = process.env.BEDROCK_MODEL_ID ?? "us.amazon.nova-lite-v1:0";

export const handler = async (event: TutorEvent): Promise<{ answer: string }> => {
  const prompt = event.arguments?.prompt?.trim();
  const context = event.arguments?.context?.trim();
  if (!prompt) throw new Error("La pregunta es obligatoria.");

  let response;
  try {
    response = await client.send(new ConverseCommand({
    modelId,
    system: [{ text: "Eres un tutor académico socrático. Responde siempre en español. Explica con claridad, no inventes fuentes y guía al estudiante con preguntas antes de dar una respuesta final." }],
    messages: [{
      role: "user",
      content: [{ text: context ? `Contexto académico:\n${context}\n\nPregunta:\n${prompt}` : prompt }],
    }],
    inferenceConfig: { temperature: 0.3, maxTokens: 700 },
  }));
  } catch (error) {
    console.error("Bedrock error", error);
    throw error;
  }
  const answer = response.output?.message?.content?.map((part) => part.text ?? "").join("").trim();
  if (!answer) throw new Error("El tutor IA no devolvió una respuesta.");
  return { answer };
};
