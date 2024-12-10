// CompletionModal.jsx
import React from "react";
import Modal from "react-modal";

function CompletionModal({
  isOpen,
  onRequestClose,
  onFileChange,
  onSubmit,
  error,
  closeModalNoImage,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Activity Complete"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <button onClick={onRequestClose} className="close-modal-button">
        X
      </button>
      <h2>Recipe Completed!</h2>
      <p>Congratulations on finishing this recipe!</p>
    </Modal>
  );
}

export default CompletionModal;
