import OpenAI from "openai";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export interface SentimentResult {
  score: number; // -1 to 1 (negative to positive)
  label: string; // e.g., "very positive", "positive", "neutral", "negative"
  emotions: string[]; // e.g., ["joy", "love", "gratitude"]
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content:
            "You are a sentiment analysis expert specializing in relationship journaling. Analyze the emotional tone and return a JSON response with: score (number from -1 to 1), label (very positive, positive, neutral, negative, or very negative), and emotions (array of emotion keywords like joy, love, gratitude, sadness, anxiety, etc.).",
        },
        {
          role: "user",
          content: `Analyze the sentiment of this journal entry: "${text}"`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content);
    
    return {
      score: parsed.score || 0,
      label: parsed.label || "neutral",
      emotions: parsed.emotions || [],
    };
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return {
      score: 0,
      label: "neutral",
      emotions: [],
    };
  }
}
