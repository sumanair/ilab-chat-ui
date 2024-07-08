import React from 'react';
import './ChatContainer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import ChatBox from './ChatBox';

const ChatContainer = ({ responses, message, setMessage, handleSendMessage, handleKeyDown, isSending }) => {
  const sendMessage = () => {
    if (!message.trim() || isSending) return;
    handleSendMessage(message);
  };

  return (
    <div className="chat-container" style={{
      backgroundImage: `url(${process.env.PUBLIC_URL}/chatbot.png)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '20px'
    }}>
      <ChatBox responses={responses} />
      <div className="input-box">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />
        <button onClick={sendMessage} disabled={isSending}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </div>
  );
};

export default ChatContainer;
