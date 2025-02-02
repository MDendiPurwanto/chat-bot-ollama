import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import ConversationManager from './ConversationManager';
import AdvancedSettings from './AdvancedSettings';
import Chatbot from './Chatbot';

function ChatApplication() {
  const [messages, setMessages] = useLocalStorage('chatMessages', []);
  const [settings, setSettings] = useState({
    temperature: 0.7,
    maxTokens: 150,
    model: 'qwen2.5:1.5b'
  });

  const availableModels = ['qwen2.5:1.5b', 'mistral', 'llama2'];

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Chatbot 
            messages={messages}
            setMessages={setMessages}
            settings={settings}
          />
          <ConversationManager 
            messages={messages}
            setMessages={setMessages}
          />
        </div>
        <div>
          <AdvancedSettings 
            availableModels={availableModels}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatApplication;
