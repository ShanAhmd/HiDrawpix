import { GoogleGenAI, Content } from "@google/genai";
import { ChatMessage } from '../types';
import { GEMINI_SYSTEM_INSTRUCTION } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development. In a real deployment, the key should be set.
  console.warn("Gemini API key not found. AI Assistant will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY as string });

const model = 'gemini-2.5-flash';

export const getChatbotResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  if (!API_KEY) {
    return "I'm sorry, my connection to the AI service is not configured. Please contact support.";
  }

  try {
    // FIX: Construct the conversation history in the format Gemini API expects for multi-turn chat.
    const contents: Content[] = [
      ...history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      {
        role: 'user',
        parts: [{ text: newMessage }],
      }
    ];

    const response = await ai.models.generateContent({
        model,
        contents: contents,
        config: {
            systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
        },
    });

    return response.text;
  } catch (error) {
    console.error("Error getting response from Gemini:", error);
    return "I'm sorry, I encountered an error. Please try again later.";
  }
};