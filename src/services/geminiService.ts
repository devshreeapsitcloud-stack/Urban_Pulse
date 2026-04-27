import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
  /**
   * Predicts when a spot will likely be free based on historical/current occupancy
   */
  async predictSpotAvailability(spotName: string, currentOccupancy: number, totalSpots: number) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Given a parking spot "${spotName}" with ${currentOccupancy}/${totalSpots} occupied, predict in how many minutes a spot is likely to become free. Return only a single number representing minutes.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              minutes: { type: Type.NUMBER }
            },
            required: ["minutes"]
          }
        }
      });
      
      const res = JSON.parse(response.text);
      return res.minutes;
    } catch (err) {
      console.error("Gemini Prediction Error:", err);
      // Fallback to random logic if AI fails
      return Math.floor(Math.random() * 15) + 5;
    }
  }
};
