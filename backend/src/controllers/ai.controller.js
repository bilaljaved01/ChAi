import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

console.log("Gemini API Key:", process.env.GEMINI_API_KEY); // 👈 Check if key loaded properly

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const askGemini = async (req, res) => {
  const { prompt } = req.body;
  console.log("Prompt received on backend:", prompt);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini AI responded with:", text); // 👈 Add this
    res.status(200).json({ reply: text });
  } catch (error) {
    console.error("Error contacting Gemini:", error.message);
    res.status(500).json({ error: "Failed to contact Gemini AI." });
  }
};
