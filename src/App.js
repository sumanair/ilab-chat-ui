import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import config from './components/utilities/config';
import Header from './components/common/Header';
import ChatHistory from './components/chatHistory/ChatHistory';
import ErrorPage from './components/common/ErrorPage';
import ChatContainer from './components/chat/ChatContainer';
import { fetchChatSessions, startNewSession } from './components/chat/ChatActions';
import { checkServerHealth } from './components/utilities/HealthCheck';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState(null);
  const [isServerHealthy, setIsServerHealthy] = useState(true);
  const [isExternalApiHealthy, setIsExternalApiHealthy] = useState(true);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedSessions, setSelectedSessions] = useState(new Set());
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        await checkServerHealth(setIsServerHealthy, setIsExternalApiHealthy, setError);
        await startNewSession(setSessionId, setError);
        fetchChatSessions(setChatSessions);
      } catch (error) {
        setError('The application server is not responding. Please try again later.');
      }
    };

    initApp();
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !isSending) {
      handleSendMessage(message);
    }
  };

  const loadChat = async (id) => {
    if (isSending) return; // Prevent changing chat sessions while sending
    try {
      const response = await axios.get(`${config.apiBaseUrl}/api/load_chat/${id}`);
      setResponses(response.data);
      setSessionId(id);
      fetchChatSessions(setChatSessions);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const updateSessionName = async (sessionId, newName) => {
    try {
      await axios.post(`${config.apiBaseUrl}/api/update_session_name`, { session_id: sessionId, new_name: newName });
      fetchChatSessions(setChatSessions);
    } catch (error) {
      console.error('Failed to update session name:', error);
    }
  };

  const deleteSession = async (id) => {
    try {
      await axios.delete(`${config.apiBaseUrl}/api/session/${id}`);
      setChatSessions(chatSessions.filter(session => session.id !== id));
      if (id === sessionId) {
        setResponses([]);
        setSessionId(null);
      }
    } catch (error) {
      console.error('Failed to delete chat session:', error);
    }
  };

  const handleSelectSession = (id) => {
    const newSelectedSessions = new Set(selectedSessions);
    if (newSelectedSessions.has(id)) {
      newSelectedSessions.delete(id);
    } else {
      newSelectedSessions.add(id);
    }
    setSelectedSessions(newSelectedSessions);
  };

  const deleteSelectedSessions = async () => {
    const sessionsToDelete = Array.from(selectedSessions);
    try {
      await axios.post(`${config.apiBaseUrl}/api/delete_sessions`, { ids: sessionsToDelete });
      setChatSessions(chatSessions.filter(session => !selectedSessions.has(session.id)));
      setSelectedSessions(new Set());
      if (sessionsToDelete.includes(sessionId)) {
        setResponses([]);
        setSessionId(null);
      }
    } catch (error) {
      console.error('Failed to delete selected chat sessions:', error);
    }
  };

  const clearAllSessions = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}/api/reset`);
      setChatSessions([]);
      setSelectedSessions(new Set());
      setResponses([]);
      setSessionId(null);
    } catch (error) {
      setError('Failed to clear chat sessions. Please try again later.');
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim() || isSending) return;
    const newMessage = message.trim();
    const temporaryResponse = { role: 'assistant', content: 'The assistant is at work...' };

    setResponses([...responses, { role: 'user', content: newMessage }, temporaryResponse]);
    setMessage('');
    setIsSending(true);

    try {
      const response = await axios.post(`${config.apiBaseUrl}/api/chat`, { message: newMessage });
      const assistantResponse = response.data.response;

      setResponses(prevResponses => prevResponses.map(res => res.content === 'The assistant is at work...' ? { role: 'assistant', content: assistantResponse } : res));
    } catch (error) {
      console.error('Failed to send message:', error);
      setResponses(prevResponses => prevResponses.map(res => res.content === 'The assistant is at work...' ? { role: 'assistant', content: 'Failed to get response. Please try again.' } : res));
    } finally {
      setIsSending(false);
    }
  };

  if (error) {
    return <ErrorPage error={error} />;
  }

  return (
    <div className="App">
      <Header />
      <div className="main-content">
        <ChatHistory
          className="chat-history"
          chatSessions={chatSessions}
          selectedSessions={selectedSessions}
          handleSelectSession={handleSelectSession}
          loadChat={loadChat}
          deleteSession={deleteSession}
          deleteSelectedSessions={deleteSelectedSessions}
          clearAllSessions={clearAllSessions}
          updateSessionName={updateSessionName}
          setSelectedSessions={setSelectedSessions} // Ensure this is passed
        />
        <ChatContainer
          responses={responses}
          setResponses={setResponses}
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
          handleKeyDown={handleKeyDown}
          isSending={isSending}
        />
      </div>
    </div>
  );
}

export default App;
