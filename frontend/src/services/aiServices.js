import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export const getAIReply = async (prompt) => {
  try {
    console.log("🚀 Calling Gemini AI with prompt:", prompt);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    console.log("✅ Gemini AI response:", response.text);
    return response.text;
  } catch (error) {
    console.error("❌ Error calling Gemini AI:", error);
    throw error;
  }
};
