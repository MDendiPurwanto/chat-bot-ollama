// src/context/ChatSettingsContext.js
import React, { createContext, useState, useContext } from 'react';

const ChatSettingsContext = createContext();

export const ChatSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    model: 'qwen2.5:1.5b',
    temperature: 0.7,
    maxTokens: 150
  });

  return (
    <ChatSettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </ChatSettingsContext.Provider>
  );
};

export const useChatSettings = () => useContext(ChatSettingsContext);
