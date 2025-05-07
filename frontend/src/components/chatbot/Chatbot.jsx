import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là trợ lý ảo của Pet Accessories Store. Tôi có thể giúp gì cho bạn?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [sessionId, setSessionId] = useState(localStorage.getItem('chatSessionId') || `session_${Date.now()}`);

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    }
  }, []);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 1) { // Only save if we have more than the initial message
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  // Save sessionId to localStorage
  useEffect(() => {
    localStorage.setItem('chatSessionId', sessionId);
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const sendChatbotMessage = async (message, sessionId) => {
    const response = await axios.post('http://localhost:5000/api/chatbot/chat', {
      message,
      sessionId
    });
    return response.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (inputMessage.trim() === '') return;
    
    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    try {
      // Send sessionId to server to maintain conversation context
      const response = await sendChatbotMessage(inputMessage, sessionId);
      
      // Update sessionId if server returns a new one
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }
      
      // Add bot response to chat
      const botMessage = {
        id: messages.length + 2,
        text: response.message,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error fetching response from chatbot:', error);
      
      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        text: "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau hoặc liên hệ qua hotline 0355292839.",
        isBot: true,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: 1,
        text: "Xin chào! Tôi là trợ lý ảo của Pet Accessories Store. Tôi có thể giúp gì cho bạn?",
        isBot: true,
        timestamp: new Date()
      }
    ]);
    localStorage.removeItem('chatHistory');
  };

  const clearConversation = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/chatbot/chat/${sessionId}`);
      
      // Create a new sessionId
      const newSessionId = `session_${Date.now()}`;
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
      
      // Clear current chat history
      setMessages([{
        id: 1,
        text: "Xin chào! Tôi là trợ lý ảo của Pet Accessories Store. Tôi có thể giúp gì cho bạn?",
        isBot: true,
        timestamp: new Date()
      }]);
      
      // Notify user
      console.log('Đã bắt đầu cuộc trò chuyện mới');
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chat icon button */}
      <button 
        className={`chatbot-toggle-btn ${isOpen ? 'open' : ''}`} 
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <i className="fas fa-times"></i>
        ) : (
          <>
            <i className="fas fa-comment"></i>
            <span className="chatbot-badge">1</span>
          </>
        )}
      </button>
      
      {/* Chat window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-title">
            <img 
              src="/images/Logo/logo_pet.png" 
              alt="Pet Store Logo" 
              className="chatbot-logo" 
            />
            <div>
              <h3>Trợ lý PetStore</h3>
              <span className="chatbot-status">Online</span>
            </div>
          </div>
          
          <div className="chatbot-header-actions">
            <button 
              className="chatbot-clear-btn"
              onClick={clearChatHistory}
              aria-label="Clear chat history"
            >
              <i className="fas fa-trash"></i>
            </button>
            <button 
              className="chatbot-close-btn"
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <i className="fas fa-minus"></i>
            </button>
          </div>
        </div>
        
        <div className="chatbot-messages">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.isBot ? 'bot-message' : 'user-message'} ${message.isError ? 'error-message' : ''}`}
            >
              {message.isBot && (
                <div className="bot-avatar">
                  <img src="/images/Logo/logo_pet.png" alt="Bot Avatar" />
                </div>
              )}
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot-message">
              <div className="bot-avatar">
                <img src="/images/Logo/logo_pet.png" alt="Bot Avatar" />
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          {/* This div is used to scroll to bottom */}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chatbot-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Nhập câu hỏi của bạn..."
            className="chatbot-input"
            disabled={isTyping}
          />
          <button 
            type="submit" 
            className="chatbot-send-btn"
            disabled={isTyping || !inputMessage.trim()}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
        
        <div className="chatbot-footer">
          <button 
            className="clear-history-btn"
            onClick={clearConversation}
          >
            Xóa lịch sử chat
          </button>
          <p>Powered by PetStore AI</p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;