import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';
import { GEMINI_SYSTEM_INSTRUCTION } from '../constants';

// Per coding guidelines, initialize GoogleGenAI directly with the API key from environment variables.
// The API key is assumed to be available and valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-flash-latest';

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

    // *** THIS IS THE FIX ***
    // Call generateContent directly on the 'ai' instance, not 'ai.models'
    const response = await ai.generateContent({
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