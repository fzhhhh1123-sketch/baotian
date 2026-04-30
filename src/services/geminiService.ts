import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generatePartLore(partName: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short, gritty, post-apocalyptic scavenger lore entry for a vehicle part named: ${partName}. Keep it under 40 words. Focus on how it was found or what it conveys about the wasteland.`,
      config: {
        systemInstruction: "You are a grizzled wasteland mechanic who loves machinery.",
      }
    });

    return response.text || "Found it in the dirt. It works, don't ask.";
  } catch (err) {
    console.error("Lore generation failed", err);
    return "Salvaged from the ruins. Heavy and reliable.";
  }
}
