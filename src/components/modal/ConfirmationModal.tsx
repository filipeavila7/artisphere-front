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

        <h3>{title}</h3>

        <p>{message}</p>

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