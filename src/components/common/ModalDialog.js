

import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const ModalDialog = ({
  isOpen,
  onRequestClose,
  title,
  message,
  confirmButtonLabel,
  secondConfirmButtonLabel,
  cancelButtonLabel,
  onConfirm,
  onSecondConfirm,
  onCancel,
  showInput,
  inputValue,
  onInputChange
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Modal Dialog"
      className="Modal"
      overlayClassName="Overlay"
    >
      <h2>{title}</h2>
      <p>{message}</p>
      {showInput && (
        <input
          type="text"
          value={inputValue}
          onChange={onInputChange}
          className="modal-input"
        />
      )}
      <div className="modal-actions">
        <button onClick={onCancel} className="cancel-button">{cancelButtonLabel || 'Cancel'}</button>
        {secondConfirmButtonLabel && <button onClick={onSecondConfirm} className="second-confirm-button">{secondConfirmButtonLabel}</button>}
        <button onClick={onConfirm} className="confirm-button">{confirmButtonLabel || 'Confirm'}</button>
      </div>
    </Modal>
  );
};

export default ModalDialog;
