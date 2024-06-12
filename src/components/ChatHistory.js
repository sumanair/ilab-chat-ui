import React, { useState } from 'react';
import './ChatHistory.css';

function ChatHistory({ chatSessions, selectedSessions, handleSelectSession, loadChat, deleteSelectedSessions, clearAllSessions, updateSessionName }) {
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [sessionName, setSessionName] = useState('');

  const handleDoubleClick = (session) => {
    setEditingSessionId(session.id);
    setSessionName(session.name || `Chat ${session.id}`);
  };

  const handleNameChange = (event) => {
    setSessionName(event.target.value);
  };

  const handleNameBlur = async () => {
    if (editingSessionId !== null) {
      await updateSessionName(editingSessionId, sessionName);
      setEditingSessionId(null);
    }
  };

  return (
    <div className="chat-history">
      <h2>Previous Chats</h2>
      <ul>
        {chatSessions.map(session => (
          <li key={session.id}>
            {editingSessionId === session.id ? (
              <input
                type="text"
                value={sessionName}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                autoFocus
              />
            ) : (
              <span onDoubleClick={() => handleDoubleClick(session)} onClick={() => loadChat(session.id)}>
                {session.name || `Chat ${session.id}`}
              </span>
            )}
            <input
              type="checkbox"
              checked={selectedSessions.has(session.id)}
              onChange={() => handleSelectSession(session.id)}
            />
          </li>
        ))}
      </ul>
      <button className="new-chat-button" onClick={() => window.location.reload()}>New Chat</button>
      <div className="chat-history-actions">
        <button onClick={deleteSelectedSessions}>Delete Selected</button>
        <button onClick={clearAllSessions}>Clear All</button>
      </div>
    </div>
  );
}

export default ChatHistory;
