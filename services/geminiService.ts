import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';
import { GEMINI_SYSTEM_INSTRUCTION } from '../constants';

// In a Next.js app, client-side environment variables must be prefixed with NEXT_PUBLIC_
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Gemini API key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const model = 'gemini-flash-latest';

export const getChatbotResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  if (!apiKey) {
    return "The AI Assistant is not configured. Missing API Key.";
  }
  
  try {
    const contents = [
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
