import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGroqApiKey } from './config';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

const groqApi = axios.create({
  baseURL: GROQ_BASE_URL,
  timeout: 5000,
});

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await groqApi.get('/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const err = error as AxiosError;
      if (err.response?.status === 401) {
        return false;
      }
    }
    return false;
  }
};

export const generateDescription = async (foodName: string): Promise<string> => {
  try {
    const apiKey = await getGroqApiKey();
    if (!apiKey) {
      throw new Error('API key not found in AsyncStorage');
    }

    const response = await groqApi.post(
      '/chat/completions',
      {
        model: 'llama-3.1-8im-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful nutrition assistant. Provide brief, engaging descriptions.',
          },
          {
            role: 'user',
            content: `Write a brief, engaging description of the food item: ${foodName}. Describe just the item itself; this is not a marketing attempt, it is informational only. The description should not include the item name.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const content = response.data?.choices?.[0]?.message?.content;
    return content ? content.trim() : "Error: Empty response from AI.";
  } catch (error) {
    console.error("Groq Generation Error:", error);
    return "Error: Could not generate description via Groq.";
  }
};