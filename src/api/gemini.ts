import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const analyzeWithGemini = async (description: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
Eres un asistente de emergencias. Analiza la siguiente descripción de un accidente/incidente y responde en formato JSON puro, sin explicaciones ni comentarios:

Descripción: """${description}"""

Responde SOLO en JSON con esta estructura:
{
  "gravedad": "leve | moderada | grave",
  "recomendaciones": "texto breve con sugerencias de seguridad",
  "instrucciones_operador": "texto breve con lo que debe decir el operador al reportante"
}
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // 🔹 Si viene con bloque de código ```json ... ```
    if (text.startsWith("```")) {
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Error en Gemini:", error);
    return null;
  }
};
