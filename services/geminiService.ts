import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';
import { GEMINI_SYSTEM_INSTRUCTION } from '../constants';

// Per coding guidelines, initialize GoogleGenAI directly with the API key from environment variables.
// The API key is assumed to be available and valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

export const getChatbotResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  try {
    // Construct the conversation history in the format Gemini API expects for multi-turn chat.
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

    // Use ai.models.generateContent instead of a separate model instance.
    const response = await ai.models.generateContent({
        model,
        contents: contents,
        config: {
            systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
        },
    });

    // Correctly access the text response.
    return response.text;
  } catch (error) {
    console.error("Error getting response from Gemini:", error);
    return "I'm sorry, I encountered an error. Please try again later.";
  }
};