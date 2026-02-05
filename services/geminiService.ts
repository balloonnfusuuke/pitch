import { GoogleGenAI } from "@google/genai";
import { Pitcher, DEFAULT_REST_RULES } from "../types";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeWorkload = async (pitcher: Pitcher): Promise<string> => {
  const ai = getAIClient();

  // Filter last 30 days of logs
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const recentLogs = pitcher.logs
    .filter(log => new Date(log.date) >= thirtyDaysAgo)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingSchedule = pitcher.schedule
    .filter(s => new Date(s.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const prompt = `
    You are an expert baseball pitching coach and physiotherapist. Analyze the workload for the following pitcher:
    
    Name: ${pitcher.name} (${pitcher.throwArm} Handed)
    
    Recent Pitch History (Last 30 Days):
    ${JSON.stringify(recentLogs.map(l => ({ date: l.date, count: l.count, type: l.type })))}
    
    Upcoming Schedule:
    ${JSON.stringify(upcomingSchedule.map(s => {
      // Handle both new range format and old single number format
      const pitches = (s.minPitches !== undefined && s.maxPitches !== undefined) 
        ? `${s.minPitches}-${s.maxPitches}` 
        : s.plannedCount;
      return { date: s.date, planned: pitches };
    }))}
    
    Rest Rules applied:
    ${JSON.stringify(DEFAULT_REST_RULES)}

    Please provide a concise analysis in Japanese (日本語) covering:
    1. Current workload status (Overworked, Balanced, Underworked).
    2. Specific advice for the upcoming schedule (considering the planned pitch count ranges) and required rest days.
    3. Any injury prevention tips based on the frequency of their outings.
    
    Keep the tone professional and encouraging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "分析データを取得できませんでした。";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI分析中にエラーが発生しました。APIキーを確認してください。";
  }
};