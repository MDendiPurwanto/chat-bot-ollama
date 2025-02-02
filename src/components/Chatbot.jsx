import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
  Send, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Copy as CopyIcon,
  Check,
  Repeat,
  X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast, { Toaster } from 'react-hot-toast';

function Chatbot({ 
  messages: propMessages = [], 
  setMessages: setPropMessages, 
  settings = {},
  className = ''
}) {

   // Deteksi environment berdasarkan hostname
   const isLocalhost = window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1';
   
    const API_URL = isLocalhost 
    ? import.meta.env.VITE_OLLAMA_API_URL_LOCAL 
    : import.meta.env.VITE_OLLAMA_API_URL_SERVER;

    const DEFAULT_MODEL = import.meta.env.VITE_DEFAULT_MODEL;
  const MAX_HISTORY = 5;
  const REQUEST_TIMEOUT = 45000; // 45 detik

  const [messages, setMessages] = useState(propMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [modelStatus, setModelStatus] = useState('Memeriksa Model...');
  const [availableModels, setAvailableModels] = useState([DEFAULT_MODEL]);

  // Tambahkan state untuk pembatalan
  const [cancelTokenSource, setCancelTokenSource] = useState(null);

  // Komponen Copy Button
  function CopyButton({ text, className = '' }) {
    const [copied, setCopied] = useState(false);
  
    const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Teks disalin');
      setTimeout(() => setCopied(false), 2000);
    };
  
    return (
      <button 
        onClick={handleCopy}
        className={`text-white/50 hover:text-white transition-colors ${className}`}
      >
        {copied ? (
          <Check className="text-green-500" size={16} />
        ) : (
          <CopyIcon size={16} />
        )}
      </button>
    );
  }

  // Ref untuk scroll otomatis
  const messagesEndRef = useRef(null);

  // Scroll ke pesan terbaru
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Sinkronkan dengan prop messages jika berubah
  useEffect(() => {
    setMessages(propMessages);
  }, [propMessages]);

  // Fungsi pembatalan permintaan
  const cancelRequest = useCallback(() => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel('Permintaan dibatalkan oleh pengguna');
      setLoading(false);
      toast.error('Permintaan dibatalkan');
    }
  }, [cancelTokenSource]);

  // Cek status model dengan timeout
  const checkModelStatus = useCallback(async () => {
    const source = axios.CancelToken.source();
    try {
      const response = await axios.get(`${API_URL}/tags`, {
        timeout: REQUEST_TIMEOUT,
        cancelToken: source.token
      });
      
      // Tambahkan logging untuk debug
      console.log(`Checking model status on: ${API_URL}`);
      
      const models = response.data.models || [];
      const modelNames = models.map(m => m.name);
      
      setAvailableModels(modelNames.length > 0 ? modelNames : [DEFAULT_MODEL]);
  
      const modelInfo = models.find(m => m.name === model);
      
      if (modelInfo) {
        setModelStatus('Aktif');
        toast.success(`Model ${model} tersedia di ${isLocalhost ? 'localhost' : 'server'}`);
      } else {
        setModel(DEFAULT_MODEL);
        setModelStatus('Tidak Tersedia');
        toast.error(`Model ${model} tidak ditemukan di ${isLocalhost ? 'localhost' : 'server'}`);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        toast.error('Pemeriksaan model dibatalkan');
      } else {
        setModelStatus('Error');
        const errorMessage = isLocalhost 
          ? 'Gagal terhubung ke Ollama lokal' 
          : 'Gagal terhubung ke server Ollama';
        toast.error(errorMessage);
        console.error('Model status check failed:', error);
      }
    }
  }, [API_URL, model, DEFAULT_MODEL, isLocalhost]);

  useEffect(() => {
    checkModelStatus();
  }, [model, checkModelStatus]);

  // Kirim pesan dengan timeout dan pembatalan
  const sendMessageToModel = useCallback(async (messagesToSend, options = {}) => {
    const source = axios.CancelToken.source();
    setCancelTokenSource(source);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        model: model,
        messages: messagesToSend,
        stream: false,
        options: {
          temperature: settings.temperature ?? 0.7,
          num_predict: settings.maxTokens ?? 512,
          ...options
        }
      }, {
        timeout: REQUEST_TIMEOUT,
        cancelToken: source.token
      });

      if (!response.data?.message?.content) {
        throw new Error('Respon model tidak valid');
      }

      return { 
        role: 'assistant', 
        content: response.data.message.content 
      };
    } catch (error) {
      if (axios.isCancel(error)) {
        return { 
          role: 'assistant', 
          content: 'Permintaan dibatalkan.' 
        };
      }

      console.error('Ollama Error:', error);
      return { 
        role: 'assistant', 
        content: error.response?.data?.error 
          ? `Kesalahan: ${error.response.data.error}`
          : 'Maaf, terjadi gangguan komunikasi dengan model AI. Silahkan Ulangi atau Re Generate'
      };
    } finally {
      setCancelTokenSource(null);
    }
  }, [API_URL, model, settings]);

  // Kirim pesan dengan penanganan error lebih baik
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const trimmedMessages = messages.slice(-MAX_HISTORY);
    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setPropMessages?.(updatedMessages);

    setInput('');
    setLoading(true);

    try {
      const botReply = await sendMessageToModel(updatedMessages);

      const finalMessages = [...updatedMessages, botReply];
      setMessages(finalMessages);
      setPropMessages?.(finalMessages);

      scrollToBottom();
    } catch (error) {
      toast.error('Gagal mengirim pesan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [input, messages, sendMessageToModel, setPropMessages, scrollToBottom]);

  // Regenerasi pesan terakhir
  const regenerateLastAssistantMessage = useCallback(async () => {
    const lastAssistantMessageIndex = messages.findLastIndex(msg => msg.role === 'assistant');
    const lastUserMessageIndex = messages.slice(0, lastAssistantMessageIndex)
      .findLastIndex(msg => msg.role === 'user');
    
    if (lastUserMessageIndex === -1) {
      toast.error('Tidak ada prompt untuk diregenerasi');
      return;
    }

    const messagesToSend = messages.slice(0, lastUserMessageIndex + 1);
    const updatedMessages = messages.slice(0, lastAssistantMessageIndex);
    
    setMessages(updatedMessages);
    setPropMessages?.(updatedMessages);
    
    setLoading(true);

    try {
      const botReply = await sendMessageToModel(messagesToSend, {
        temperature: Math.min((settings.temperature ?? 0.7) + 0.1, 1),
      });

      const finalMessages = [...updatedMessages, botReply];
      setMessages(finalMessages);
      setPropMessages?.(finalMessages);

      scrollToBottom();
    } catch (error) {
      toast.error('Gagal regenerasi pesan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [messages, sendMessageToModel, setPropMessages, settings, scrollToBottom]);

  // Render status model
  const renderModelStatus = () => {
    const statusMap = {
      'Aktif': {
        color: 'text-green-500',
        icon: CheckCircle,
        text: 'Model Siap'
      },
      'Tidak Tersedia': {
        color: 'text-yellow-500',
        icon: AlertTriangle,
        text: 'Model Tidak Tersedia'
      },
      'Error': {
        color: 'text-red-500',
        icon: AlertTriangle,
        text: 'Gagal Memeriksa Model'
      },
      'default': {
        color: 'text-gray-500',
        icon: RefreshCw,
        text: 'Memeriksa Model...'
      }
    };

    const { color, icon: Icon, text } = statusMap[modelStatus] || statusMap['default'];

    return (
      <div className={`${color} flex items-center`}>
        <Icon className="mr-2" size={16} />
        {text}
      </div>
    );
  };

  // Render pesan dengan memoization
  const MemoizedMessages = useMemo(() => {
    return messages.map((msg, index) => (
      <div 
        key={index} 
        className={`flex relative ${
          msg.role === 'user' 
            ? 'justify-end' 
            : 'justify-start'
        }`}
      >
        <div 
          className={`max-w-[80%] p-3 rounded-lg relative ${
            msg.role === 'user' 
              ? 'bg-blue-600 text-white' 
              : 'bg-[#2a2a2a] text-white'
          }`}
        >
          {msg.role === 'assistant' && (
            <div className="absolute top-1 right-10">
              <button
                onClick={regenerateLastAssistantMessage}
                disabled={loading}
                className="text-white/50 hover:text-white transition-colors disabled:opacity-50"
              >
                <Repeat size={16} />
              </button>
            </div>
          )}

          {msg.role === 'assistant' && (
            <div className="absolute top-1 right-1">
              <CopyButton 
                text={msg.content} 
                className="text-white/50 hover:text-white"
              />
            </div>
          )}

          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="relative">
                    <CopyButton 
                      text={String(children)} 
                      className="absolute top-1 right-1 text-white/50 hover:text-white z-10"
                    />
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      </div>
    ));
  }, [messages, loading, regenerateLastAssistantMessage]);

  return (
    <div className={`flex flex-col h-full bg-[#1a1a1a] rounded-lg ${className}`}>
      {/* Header dengan tombol pembatalan */}
      <div className="bg-[#2a2a2a] p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <select 
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              checkModelStatus();
            }}
            className="bg-[#1a1a1a] text-white p-1 rounded"
          >
            {availableModels.map(modelName => (
              <option key={modelName} value={modelName}>
                {modelName}
              </option>
            ))}
          </select>
          {renderModelStatus()}
        </div>
        {loading && (
          <button 
            onClick={cancelRequest}
            className="text-red-500 hover:bg-red-500/10 p-1 rounded transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Area Pesan */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {MemoizedMessages}
        {loading && (
          <div className="flex justify-center items-center space-x-1.5">
            <div className="w-2 h-2 bg-white/70 rounded-full animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="w-2 h-2 bg-white/70 rounded-full animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite_0.2s]"></div>
            <div className="w-2 h-2 bg-white/70 rounded-full animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite_0.4s]"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Pesan */}
      <div className="bg-[#2a2a2a] p-4 rounded-b-lg">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-grow p-2 bg-[#1a1a1a] text-white rounded resize-none"
            placeholder="Tulis pesan..."
            rows={3}
            disabled={loading}
          />
          <button 
            onClick={sendMessage}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          }
        }}
      />
    </div>
  );
}

export default Chatbot;
