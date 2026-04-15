import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "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";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = '48px';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }
    setIsLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-OpenRouter-Title': 'Minimax AI Chat',
        },
        body: JSON.stringify({
          model: 'minimax/minimax-m2.5:free',
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        const botMessage = data.choices[0].message;
        setMessages((prev) => [...prev, botMessage]);
      } else {
        console.error('Error in response:', data);
        const errorMessage = data.error?.metadata?.raw || data.error?.message || 'Erro desconhecido ao comunicar com a API.';
        setMessages((prev) => [...prev, { role: 'assistant', content: `**Aviso do OpenRouter:**\n\n${errorMessage}` }]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Desculpe, não foi possível conectar com a API no momento.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-icon">
          <Sparkles color="white" size={20} />
        </div>
        <div>
          <h1>Minimax AI</h1>
          <p>Potencializado pelo modelo minimax-m2.5:free via OpenRouter</p>
        </div>
      </header>

      <main className="chat-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Bot size={40} color="#8b5cf6" />
            </div>
            <h2>Como posso ajudar hoje?</h2>
            <p>Envie uma mensagem abaixo para começar a conversar com o modelo Minimax através do OpenRouter.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`message-wrapper ${message.role === 'user' ? 'user' : 'bot'}`}>
              <div className={`message ${message.role === 'user' ? 'user' : 'bot'}`}>
                <div className="message-header">
                  {message.role === 'user' ? (
                    <><User size={16} /> Você</>
                  ) : (
                    <><Bot size={16} /> Minimax AI</>
                  )}
                </div>
                {message.role === 'assistant' ? (
                  <div className="markdown-body">
                    <ReactMarkdown>
                      {typeof message.content === 'string' ? message.content : String(message.content || '')}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {typeof message.content === 'string' ? message.content : String(message.content || '')}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="message-wrapper bot">
            <div className="message bot">
              <div className="message-header">
                <Bot size={16} /> Minimax AI
              </div>
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="input-container">
        <div className="input-box">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem aqui..."
            rows="1"
            disabled={isLoading}
          />
          <button 
            className="send-btn" 
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
