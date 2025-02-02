import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Settings, 
  Trash2, 
  Sparkles,
  Menu,
  X 
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import ConversationManager from './components/ConversationManager';
import AdvancedSettings from './components/AdvancedSettings';
import Chatbot from './components/Chatbot';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const OLLAMA_API_URL = import.meta.env.VITE_OLLAMA_API_URL;
  const DEFAULT_MODEL = import.meta.env.VITE_DEFAULT_MODEL;
  const [messages, setMessages] = useLocalStorage('chatMessages', []);
  const [activeView, setActiveView] = useState('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const [settings, setSettings] = useState({
    model: DEFAULT_MODEL,
    temperature: 0.7,
    maxTokens: 512,
    top_p: 0.8
  });
  
  const availableModels = [DEFAULT_MODEL];

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSettingsChange = (newSettings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  const clearConversation = () => {
    setMessages([]);
  };

  // Render Navigasi
  const renderNavigation = () => {
    if (isMobile) {
      return isMobileMenuOpen ? (
        <div className="fixed inset-0 bg-[#1a1a1a] z-50 flex flex-col">
          <div className="p-4 flex justify-end">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <button 
              onClick={() => {
                setActiveView('chat');
                setIsMobileMenuOpen(false);
              }}
              className={`p-3 rounded-lg w-full ${
                activeView === 'chat' 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-[#2a2a2a] text-gray-400'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <MessageSquare />
                <span>Chat</span>
              </div>
            </button>
            <button 
              onClick={() => {
                setActiveView('settings');
                setIsMobileMenuOpen(false);
              }}
              className={`p-3 rounded-lg w-full ${
                activeView === 'settings' 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-[#2a2a2a] text-gray-400'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Settings />
                <span>Pengaturan</span>
              </div>
            </button>
          </div>
        </div>
      ) : null;
    }

    // Navigasi Desktop
    return (
      <div className="w-20 bg-[#1a1a1a] flex flex-col items-center py-6 space-y-4">
        <button 
          onClick={() => setActiveView('chat')}
          className={`p-3 rounded-lg ${
            activeView === 'chat' 
              ? 'bg-blue-600 text-white' 
              : 'hover:bg-[#2a2a2a] text-gray-400'
          }`}
        >
          <MessageSquare />
        </button>
        <button 
          onClick={() => setActiveView('settings')}
          className={`p-3 rounded-lg ${
            activeView === 'settings' 
              ? 'bg-blue-600 text-white' 
              : 'hover:bg-[#2a2a2a] text-gray-400'
          }`}
        >
          <Settings />
        </button>
      </div>
    );
  };

  // Render Konten
  const renderContent = () => {
    if (isMobile) {
      return activeView === 'chat' ? (
        <div className="flex-1 flex flex-col">
          <Chatbot 
            messages={messages}
            setMessages={setMessages}
            settings={settings}
            className="flex-1"
          />
        </div>
      ) : (
        <div className="flex-1 bg-[#0f0f0f] p-4">
          <AdvancedSettings 
            availableModels={availableModels}
            currentSettings={settings}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      );
    }

    // Konten Desktop
    return activeView === 'chat' ? (
      <div className="flex-1 flex">
        <div className="flex-grow bg-[#0f0f0f] p-4">
          <Chatbot 
            messages={messages}
            setMessages={setMessages}
            settings={settings}
            className="h-full"
          />
        </div>
        
        <div className="w-64 bg-[#1a1a1a] p-4 border-l border-[#2a2a2a]">
          <ConversationManager 
            messages={messages}
            setMessages={setMessages}
          />
        </div>
      </div>
    ) : (
      <div className="flex-1 bg-[#0f0f0f] p-6">
        <AdvancedSettings 
          availableModels={availableModels}
          currentSettings={settings}
          onSettingsChange={handleSettingsChange}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex">
      {/* Mobile Menu Toggle */}
      {isMobile && !isMobileMenuOpen && (
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-50 text-white bg-[#1a1a1a] p-2 rounded-lg"
        >
          <Menu />
        </button>
      )}

      {/* Navigasi */}
      {!isMobile && renderNavigation()}

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#1a1a1a] p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-blue-500" />
            {isMobile ? <span className="pl-16">Ollama AI Assistant</span> : 'Ollama AI Assistant'}
          </div>
          <button 
            onClick={clearConversation}
            className="text-red-500 hover:bg-[#2a2a2a] p-2 rounded-lg"
          >
            <Trash2 />
          </button>
        </div>

        {/* Area Konten */}
        <div className="flex flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>

      {/* Mobile Navigation */}
      {renderNavigation()}

      {/* Toaster Notifications */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
          },
        }} 
      />
    </div>
  );
}

export default App;
