import { GoogleGenAI, Chat } from "@google/genai";
import { MODEL_NAME, SYSTEM_INSTRUCTION } from "../constants";

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

export const initializeGemini = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
        console.error("API_KEY is missing from environment variables.");
        throw new Error("API Key not found");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const createChatSession = (): Chat => {
  const aiInstance = initializeGemini();
  chatSession = aiInstance.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7, // Balance between creativity and strict instruction adherence
    },
  });
  return chatSession;
};

export const getChatSession = (): Chat => {
  if (!chatSession) {
    return createChatSession();
  }
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const chat = getChatSession();
    const result = await chat.sendMessage({ message });
    return result.text || "Xin lỗi, tôi không thể tạo phản hồi lúc này.";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};
