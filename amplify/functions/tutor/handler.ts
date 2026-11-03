interface TutorEvent {
  arguments?: {
    prompt?: string;
    context?: string;
  };
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

export const handler = async (event: TutorEvent): Promise<{ answer: string }> => {
  const prompt = event.arguments?.prompt?.trim();
  const context = event.arguments?.context?.trim();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!prompt) throw new Error("La pregunta es obligatoria.");
  if (!apiKey) throw new Error("El tutor IA no está configurado.");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: "Eres un tutor académico socrático. Explica con claridad, no inventes fuentes y guía al estudiante con preguntas antes de dar una respuesta final." }],
      },
      contents: [{
        role: "user",
        parts: [{ text: context ? `Contexto académico:\n${context}\n\nPregunta:\n${prompt}` : prompt }],
      }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 700 },
    }),
  });
  if (!response.ok) throw new Error(`El tutor IA respondió con estado ${response.status}.`);
  const payload = await response.json() as GeminiResponse;
  const answer = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!answer) throw new Error("El tutor IA no devolvió una respuesta.");
  return { answer };
};
