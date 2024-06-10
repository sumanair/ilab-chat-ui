import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import config from './config';

function App() {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState(null);
  const [isServerHealthy, setIsServerHealthy] = useState(true);
  const [isExternalApiHealthy, setIsExternalApiHealthy] = useState(true);

  useEffect(() => {
    // Check the health of the Flask server
    axios.get(`${config.apiBaseUrl}/health`)
      .then(response => {
        if (response.status === 200 && response.data.status === 'healthy') {
          setIsServerHealthy(true);
          if (response.data.external_api_status === 'healthy') {
            setIsExternalApiHealthy(true);
          } else {
            setIsExternalApiHealthy(false);
            setError('ilab server is not responding. This could be due to resource constraints if you are running it locally. Please try again later.<br>If you are experiencing this multiple times, please check if ilab serve is running. You may also have to restart it.');
          }
        } else {
          setIsServerHealthy(false);
          setError('The chat application server is not responding. Please ensure the Flask server is running and try again.');
        }
      })
      .catch(() => {
        setIsServerHealthy(false);
        setError('The chat application server is not responding. Please ensure the Flask server is running and try again.');
      });
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const response = await axios.post(`${config.apiBaseUrl}/chat`, { message });
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Chat with ilab</h1>
      </header>
      {(!isServerHealthy || !isExternalApiHealthy) ? (
        <div className="server-error">
          <img src="/error-background.png" alt="Error Background" className="error-image" />
          <p dangerouslySetInnerHTML={{ __html: error }}></p>
        </div>
      ) : (
        <>
          <div className="chat-box">
            {responses.map((res, index) => (
              <div key={index} className={`message ${res.role}`}>
                <span>{res.role === 'user' ? 'You' : 'Assistant'}: </span>
                {res.content}
              </div>
            ))}
          </div>
          <div className="input-box">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
