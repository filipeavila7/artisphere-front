import { IoMdClose } from "react-icons/io";
import "../../styles/modal.css"


interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) {

  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirmation-overlay" onClick={onCancel}>
      <div
        className="confirmation-modal"
        onClick={(e) => e.stopPropagation()}
      >

        <div onClick={onCancel} className="confirmation-close">
            <IoMdClose />
        </div>

        <h3>{title}</h3>

        <div className="confirmation-content">
            <img className="confirmation-avatar" src="/avatar-6.png" alt="" />
            <p>{message}</p>
        </div>

        

        <div className="confirmation-actions">
          <button
            className="confirmation-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>

          <button
            className="confirmation-confirm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ConfirmationModal;