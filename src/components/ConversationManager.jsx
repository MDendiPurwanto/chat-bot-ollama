import React, { useState } from 'react';
import { saveAs } from 'file-saver';

function ConversationManager({ messages, setMessages }) {
  // Ekspor Percakapan
  const exportConversation = () => {
    const conversationJson = JSON.stringify(messages, null, 2);
    const blob = new Blob([conversationJson], { type: 'application/json' });
    saveAs(blob, `ollama_chat_${new Date().toISOString()}.json`);
  };

  // Impor Percakapan
  const importConversation = (event) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      try {
        const importedMessages = JSON.parse(e.target.result);
        // Validasi struktur pesan
        if (Array.isArray(importedMessages)) {
          setMessages(importedMessages);
        } else {
          alert('Format file tidak valid');
        }
      } catch (error) {
        console.error('Gagal impor percakapan:', error);
        alert('Gagal membaca file');
      }
    };
    
    const file = event.target.files[0];
    if (file) {
      fileReader.readAsText(file);
    }
  };

  return (
    <div className="flex space-x-2 mb-4">
      <button 
        onClick={exportConversation}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Ekspor Percakapan
      </button>
    
    </div>
  );
}

export default ConversationManager;
