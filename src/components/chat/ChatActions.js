// components/ChatActions.js

import axios from 'axios';
import config from '../utilities/config';

const fetchChatSessions = async (setChatSessions) => {
  try {
    const response = await axios.get(`${config.apiBaseUrl}/api/sessions`);
    setChatSessions(response.data);
  } catch (error) {
    console.error('Failed to fetch chat sessions:', error);
  }
};

const startNewSession = async (setSessionId, setError) => {
  try {
    const response = await axios.post(
      `${config.apiBaseUrl}/api/new_chat`,
      { folder_id: null }, // Adjust this as needed
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    setSessionId(response.data.session_id);
  } catch (error) {
    setError('Failed to start a new session. Please try again later.');
    console.error('Failed to start a new session:', error);
  }
};

const handleSendMessage = async (message, sessionId, setResponses, setMessage, responses, setError) => {
  if (!message.trim() || !sessionId) return;

  try {
    const response = await axios.post(
      `${config.apiBaseUrl}/api/chat`,
      { message, session_id: sessionId },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    const assistantResponse = response.data.response;
    setResponses([...responses, { role: 'user', content: message }, { role: 'assistant', content: assistantResponse }]);
    setMessage('');
  } catch (error) {
    setError('Failed to send message. Please try again later.');
    console.error('Failed to send message:', error);
  }
};

export { fetchChatSessions, startNewSession, handleSendMessage };
