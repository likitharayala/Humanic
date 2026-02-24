import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Trash2, Loader2, Info } from 'lucide-react';
import './App.css';

const API_URL = 'https://viatras-rag.onrender.com/chat';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Humanic Assistant, your virtual AI helper. How can I help you today?",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(localStorage.getItem('chat_session_id') || '');
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          session_id: sessionId
        }),
      });

      if (!response.ok) {
        if (response.status === 502) {
          throw new Error('Assistant is starting up. This can take 20-30 seconds on the first request.');
        }
        throw new Error('Failed to get response from server.');
      }

      const data = await response.json();

      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
        localStorage.setItem('chat_session_id', data.session_id);
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'ai',
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Chat Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: "Hi! I'm Humanic Assistant, your virtual AI helper. How can I help you today?",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setSessionId('');
    localStorage.removeItem('chat_session_id');
    setError(null);
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="bot-avatar">
          <Bot size={24} color="white" />
        </div>
        <div className="bot-info">
          <h2>HUMANIC</h2>
          <p>AI Assistant</p>
        </div>
      </header>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
            <div className="message-bubble">
              {msg.text}
            </div>
            <span className="message-time">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="message-wrapper ai">
            <div className="message-bubble typing-indicator">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="chat-input-container">
        <form className="input-form" onSubmit={handleSend}>
          <input
            type="text"
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Write a message..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="send-button"
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '0.65rem', color: '#86868b', marginTop: '12px' }}>
          Powered by HUMANIC AI Engine
        </p>
      </div>
    </div>
  );
}

export default App;
