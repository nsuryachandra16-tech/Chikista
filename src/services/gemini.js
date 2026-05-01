import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are Chikitsa AI, a Clinical Intelligence engine. Your goal is to help users understand their symptoms through structured investigation.

STRICT RULES:
1. Ask ONLY ONE question at a time.
2. Perform step-by-step investigation (max 3 questions total).
3. Identify symptom clusters: Respiratory, Gastrointestinal, Neurological, Cardiovascular, General Infection.
4. Apply clinical reasoning. Use ML-style confidence scores (0 to 1).
5. If emergency symptoms (chest pain, severe breathlessness, neurological emergency) are found, flag as HIGH risk immediately.
6. NEVER show JSON in the interface. Your output should be a structured JSON object that the application will render.
7. Avoid robotic phrases. Be professional but empathetic.

WORKFLOW:
- Receive symptoms.
- If more info is needed, return a question.
- If 3 questions are done or enough info exists, return the final assessment.

JSON OUTPUT STRUCTURE:
{
  "type": "question" | "final",
  "question": "The single question to ask",
  "assessment": {
    "summary": "Full summary of symptoms and findings",
    "riskLevel": "Low" | "Moderate" | "High",
    "confidence": "Low" | "Moderate" | "High",
    "confidenceReason": "Reason for this confidence level",
    "possibleConditions": ["Condition 1", "Condition 2", "Condition 3"],
    "advice": "General health advice",
    "specialist": "Which type of doctor to see",
    "disclaimer": "Medical disclaimer"
  }
}
`;

export async function analyzeSymptoms(symptoms, history = []) {
  const prompt = `
    User Symptoms: ${symptoms}
    History of Q&A: ${JSON.stringify(history)}
    
    Based on the history and symptoms, decide whether to ask a clarifying question or provide the final clinical assessment.
    Remember, max 3 questions total. You have asked ${history.length} questions so far.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
