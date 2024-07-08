import React from 'react';
import './InputBox.css';

const InputBox = ({ message, setMessage, handleSendMessage, handleKeyDown }) => {
  return (
    <div className="input-box">
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default InputBox;
