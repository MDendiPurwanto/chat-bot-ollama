// src/utils/apiClient.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_OLLAMA_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Perpanjang timeout
});

export const ollamaService = {
  async sendMessage(model, messages, settings) {
    try {
      const response = await apiClient.post('/chat', {
        model,
        messages,
        stream: false, // Nonaktifkan streaming
        options: {
          temperature: settings?.temperature || 0.7,
          num_predict: settings?.maxTokens || 150
        }
      });
      return response.data;
    } catch (error) {
      console.error('Ollama API Error:', error.response?.data || error.message);
      throw error;
    }
  }
};
