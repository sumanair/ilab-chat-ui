import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import config from './config';
import Header from './components/Header';
import ChatBox from './components/ChatBox';
import InputBox from './components/InputBox';
import ChatHistory from './components/ChatHistory';
import ErrorPage from './components/ErrorPage';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState(null);
  const [isServerHealthy, setIsServerHealthy] = useState(true);
  const [isExternalApiHealthy, setIsExternalApiHealthy] = useState(true);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedSessions, setSelectedSessions] = useState(new Set());

  const fetchChatSessions = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/api/sessions`);
      setChatSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
    }
  };

  useEffect(() => {
    const startNewSession = async () => {
      try {
        const response = await axios.post(`${config.apiBaseUrl}/api/new_chat`);
        setSessionId(response.data.session_id);
      } catch (error) {
        setError('Failed to start a new session. Please try again later.');
      }
    };

    const checkServerHealth = async () => {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/api/health`);
        if (response.status === 200 && response.data.status === 'healthy') {
          setIsServerHealthy(true);
          if (response.data.external_api_status === 'healthy') {
            setIsExternalApiHealthy(true);
          } else {
            setIsExternalApiHealthy(false);
            setError('Ilab server is not responding. This could be due to resource constraints if you are running it locally. Please try again later.<br>If you are experiencing this multiple times, please check if ilab serve is running. You may also have to restart it.');
          }
        } else {
          setIsServerHealthy(false);
          setError('The application server is not responding. Please ensure the Flask server is running and try again.');
        }
      } catch (error) {
        setIsServerHealthy(false);
        setError('The application server is not responding. Please ensure the Flask server is running and try again.');
      }
    };

    const initApp = async () => {
      try {
        await axios.get(`${config.apiBaseUrl}/api/health`);
        await startNewSession();
        await checkServerHealth();
        fetchChatSessions();
      } catch (error) {
        setError('The application server is not responding. Please ensure the Flask server is running and try again.');
      }
    };

    initApp();
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || !sessionId) return;

    try {
      const response = await axios.post(`${config.apiBaseUrl}/api/chat`, { message, session_id: sessionId });
      const assistantResponse = response.data.response;
      setResponses([...responses, { role: 'user', content: message }, { role: 'assistant', content: assistantResponse }]);
      setMessage('');
    } catch (error) {
      setError('Failed to send message. Please try again later.');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const loadChat = async (id) => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/api/load_chat/${id}`);
      setResponses(response.data);
      setSessionId(id);
      await fetchChatSessions();
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const updateSessionName = async (sessionId, newName) => {
    try {
      await axios.post(`${config.apiBaseUrl}/api/update_session_name`, { session_id: sessionId, new_name: newName });
      await fetchChatSessions();
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
        />
        <div
          className="chat-container"
          style={{
            backgroundImage: `url(chatbot.png)`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.7,
          }}
        >
          <ChatBox responses={responses} />
          <InputBox
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            handleKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
