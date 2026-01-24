import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export interface AIAnalysisResult {
  severity: "BASIC" | "UCI";
  severity_reason: string;
  recommendations: string[];
  operator_instructions: string[];
  paramedic_recommendations: string[];
}

export const analyzeWithGemini = async (description: string): Promise<AIAnalysisResult | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    Actúa como un experto despachador de emergencias con conocimientos médicos y de seguridad pública.
    Analiza la siguiente descripción de un incidente y provee una evaluación estructurada en formato JSON.

    Descripción del incidente: """${description}"""

    Reglas de respuesta:
    1. Determina la gravedad:
       - "BASIC": Para incidentes menores, lesiones leves, sin riesgo vital inmediato (ej. fracturas cerradas, malestar general, choques simples).
       - "UCI": Para incidentes críticos, riesgo vital, múltiples heridos graves, inconsciencia, dificultad respiratoria severa.
    2. Proporciona una razón breve y contundente para la gravedad.
    3. Lista recomendaciones de seguridad inmediatas para la escena.
    4. Lista instrucciones claras que el operador debe dar al reportante.
    5. Lista recomendaciones clave para los paramédicos que atenderán el incidente.

    Formato de salida (JSON puro, sin bloques de código ni markdown):
    {
      "severity": "BASIC" | "UCI",
      "severity_reason": "Explicación breve de la gravedad detectada (máx 15 palabras).",
      "recommendations": ["Recomendación 1", "Recomendación 2", ...],
      "operator_instructions": ["Paso 1", "Paso 2", ...],
      "paramedic_recommendations": ["Recomendación para paramédico 1", "Recomendación para paramédico 2", ...]
    }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Limpieza de formato markdown si el modelo lo incluye
    if (text.startsWith("```")) {
      text = text.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    }

    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Error en el análisis de Gemini:", error);
    return null;
  }
};