import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChatHistory.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faCheck, faEdit, faFolder, faArrowRight, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import config from '../utilities/config';
import ModalDialog from '../common/ModalDialog';

function ChatHistory({ selectedSessions, handleSelectSession, loadChat, deleteSelectedSessions, clearAllSessions, updateSessionName, setSelectedSessions }) {
  const [folders, setFolders] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [movingSessionId, setMovingSessionId] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    fetchFolders();
    fetchChatSessions();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/api/folders`);
      setFolders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  const fetchChatSessions = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/api/all_sessions`);
      const { no_folder_sessions = [], folders: fetchedFolders = [] } = response.data || {};
      setFolders(fetchedFolders);
      setChatSessions(no_folder_sessions);
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
    }
  };

  const handleDoubleClick = (session) => {
    setEditingId(session.id);
    setSessionName(session.name || `Chat ${session.id}`);
  };

  const handleNameChange = (event) => {
    setSessionName(event.target.value);
  };

  const handleNameBlur = async () => {
    if (editingId !== null) {
      await updateSessionName(editingId, sessionName);
      setEditingId(null);
      fetchChatSessions();
    }
  };

  const handleNameKeyDown = async (event) => {
    if (event.key === 'Enter') {
      await handleNameBlur();
    }
  };

  const handleAddFolder = () => {
    setIsAddFolderModalOpen(true);
  };

  const handleConfirmAddFolder = async () => {
    if (newFolderName) {
      try {
        await axios.post(`${config.apiBaseUrl}/api/folders`, { name: newFolderName }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        fetchFolders();
        setNewFolderName('');
        setIsAddFolderModalOpen(false);
      } catch (error) {
        console.error('Failed to add folder:', error);
      }
    }
  };

  const handleCancelAddFolder = () => {
    setNewFolderName('');
    setIsAddFolderModalOpen(false);
  };

  const handleUpdateFolder = async (folderId) => {
    const folderName = prompt('Enter new folder name:');
    if (folderName) {
      try {
        await axios.put(`${config.apiBaseUrl}/api/folders/${folderId}`, { name: folderName }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        fetchFolders();
      } catch (error) {
        console.error('Failed to update folder:', error);
      }
    }
  };

  const handleDeleteFolder = (folderId) => {
    setFolderToDelete(folderId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteFolderOnly = async () => {
    if (folderToDelete !== null) {
      try {
        await axios.delete(`${config.apiBaseUrl}/api/folders/${folderToDelete}`);
        setFolderToDelete(null);
        setIsDeleteModalOpen(false);
        fetchFolders();
        fetchChatSessions();
      } catch (error) {
        console.error('Failed to delete folder:', error);
      }
    }
  };

  const handleConfirmDeleteWithContents = async () => {
    if (folderToDelete !== null) {
      try {
        await axios.delete(`${config.apiBaseUrl}/api/folders/${folderToDelete}/delete_with_contents`);
        setFolderToDelete(null);
        setIsDeleteModalOpen(false);
        fetchFolders();
        fetchChatSessions();
      } catch (error) {
        console.error('Failed to delete folder with contents:', error);
      }
    }
  };

  const handleCancelDelete = () => {
    setFolderToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleMoveSession = async (sessionId, folderId) => {
    try {
      await axios.post(`${config.apiBaseUrl}/api/sessions/${sessionId}/move`, { folder_id: folderId }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      fetchFolders();
      fetchChatSessions();
      setMovingSessionId(null);
    } catch (error) {
      console.error('Failed to move session:', error);
    }
  };

  const handleSelectFolderForMove = (event) => {
    const folderId = event.target.value === "null" ? null : event.target.value;
    handleMoveSession(movingSessionId, folderId);
  };

  const toggleFolderExpansion = (folderId) => {
    setExpandedFolders(prevExpandedFolders => {
      const newExpandedFolders = new Set(prevExpandedFolders);
      if (newExpandedFolders.has(folderId)) {
        newExpandedFolders.delete(folderId);
      } else {
        newExpandedFolders.add(folderId);
      }
      return newExpandedFolders;
    });
  };

  const handleDeleteSelected = async () => {
    const sessionsToDelete = Array.from(selectedSessions);
    try {
      await axios.post(`${config.apiBaseUrl}/api/delete_sessions`, { ids: sessionsToDelete });
      fetchChatSessions();
      setSelectedSessions(new Set());
    } catch (error) {
      console.error('Failed to delete selected chat sessions:', error);
    }
  };

  return (
    <div className="chat-history">
      <h2>Previous Chats</h2>
      <hr />
      <ul>
        {chatSessions.length > 0 && (
          <li className="no-folder-container">
            {chatSessions.map(session => (
              <div key={session.id} className="session-item">
                <input
                  type="checkbox"
                  checked={selectedSessions.has(session.id)}
                  onChange={() => handleSelectSession(session.id)}
                />
                {editingId === session.id ? (
                  <input
                    type="text"
                    value={sessionName}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    onKeyDown={handleNameKeyDown}
                    autoFocus
                  />
                ) : (
                  <span onDoubleClick={() => handleDoubleClick(session)} onClick={() => loadChat(session.id)}>
                    {session.name || `Chat ${session.id}`}
                  </span>
                )}
                <div className="session-controls">
                  <button className="icon-button" onClick={() => setMovingSessionId(session.id)} title="Move to Folder">
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                  {movingSessionId === session.id && (
                    <select onChange={handleSelectFolderForMove} value="">
                      <option value="" disabled>Select folder</option>
                      {folders.map(folder => (
                        <option key={folder.id} value={folder.id}>{folder.name}</option>
                      ))}
                      <option value="null">No Folder</option>
                    </select>
                  )}
                  <button className="icon-button" onClick={() => setEditingId(session.id)} title="Edit Session">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </div>
              </div>
            ))}
          </li>
        )}
        {folders.map(folder => (
          <li key={folder.id} className="folder-item">
            <div className="folder-header">
              <button className="icon-button" onClick={() => toggleFolderExpansion(folder.id)} title={expandedFolders.has(folder.id) ? "Collapse" : "Expand"}>
                <FontAwesomeIcon icon={expandedFolders.has(folder.id) ? faChevronDown : faChevronRight} />
              </button>
              <FontAwesomeIcon icon={faFolder} />
              <span onDoubleClick={() => handleUpdateFolder(folder.id)}>{folder.name}</span>
              <div className="folder-controls">
                <button className="icon-button" onClick={() => handleUpdateFolder(folder.id)} title="Edit Folder">
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button className="icon-button" onClick={() => handleDeleteFolder(folder.id)} title="Delete Folder">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
            {expandedFolders.has(folder.id) && (
              <ul className="folder-contents">
                {folder.sessions && folder.sessions.map(session => (
                  <li key={session.id} className="session-item indented">
                    <input
                      type="checkbox"
                      checked={selectedSessions.has(session.id)}
                      onChange={() => handleSelectSession(session.id)}
                    />
                    {editingId === session.id ? (
                      <input
                        type="text"
                        value={sessionName}
                        onChange={handleNameChange}
                        onBlur={handleNameBlur}
                        onKeyDown={handleNameKeyDown}
                        autoFocus
                      />
                    ) : (
                      <span onDoubleClick={() => handleDoubleClick(session)} onClick={() => loadChat(session.id)}>
                        {session.name || `Chat ${session.id}`}
                      </span>
                    )}
                    <div className="session-controls">
                      <button className="icon-button" onClick={() => setMovingSessionId(session.id)} title="Move Out">
                        <FontAwesomeIcon icon={faArrowRight} />
                      </button>
                      {movingSessionId === session.id && (
                        <select onChange={handleSelectFolderForMove} value="">
                          <option value="" disabled>Select folder</option>
                          <option value="null">No Folder</option>
                          {folders.map(folder => (
                            <option key={folder.id} value={folder.id}>{folder.name}</option>
                          ))}
                        </select>
                      )}
                      <button className="icon-button" onClick={() => setEditingId(session.id)} title="Edit Session">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <div className="chat-history-actions">
        <div className="dropdown">
          <button className="icon-button" title="Add Options">
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <div className="dropdown-content">
            <button onClick={() => window.location.reload()}>
              <FontAwesomeIcon icon={faPlus} /> New Chat
            </button>
            <button onClick={handleAddFolder}>
              <FontAwesomeIcon icon={faPlus} /> Add Folder
            </button>
          </div>
        </div>
        <div className="dropdown">
          <button className="icon-button" title="Delete Options">
            <FontAwesomeIcon icon={faTrash} />
          </button>
          <div className="dropdown-content">
            <button onClick={handleDeleteSelected}>
              <FontAwesomeIcon icon={faCheck} /> Delete Selected
            </button>
            <button onClick={clearAllSessions}>
              <FontAwesomeIcon icon={faTrash} /> Delete All
            </button>
          </div>
        </div>
      </div>
      <ModalDialog
        isOpen={isDeleteModalOpen}
        onRequestClose={handleCancelDelete}
        title="Confirm Deletion"
        message="Do you want to delete the folder or delete the folder and its chats?"
        confirmButtonLabel="Delete Folder Only"
        secondConfirmButtonLabel="Delete Folder and Chats"
        onConfirm={handleConfirmDeleteFolderOnly}
        onSecondConfirm={handleConfirmDeleteWithContents}
        cancelButtonLabel="Cancel"
        onCancel={handleCancelDelete}
        showInput={false}
      />
      <ModalDialog
        isOpen={isAddFolderModalOpen}
        onRequestClose={handleCancelAddFolder}
        title="Add New Folder"
        message="Enter the name of the new folder:"
        confirmButtonLabel="Add Folder"
        onConfirm={handleConfirmAddFolder}
        cancelButtonLabel="Cancel"
        onCancel={handleCancelAddFolder}
        showInput={true}
        inputValue={newFolderName}
        onInputChange={(e) => setNewFolderName(e.target.value)}
      />
    </div>
  );
}

export default ChatHistory;
