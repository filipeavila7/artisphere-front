import type { Toast } from "../../context/ToastContext";
import "../../styles/toast.css"

interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: number) => void;
}

export default function ToastContainer({
    toasts,
    onDismiss,
}: ToastContainerProps) {
    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type}`}
                >
                    <span>{toast.message}</span>

                    <button onClick={() => onDismiss(toast.id)}>
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}