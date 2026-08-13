import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";

import type { ReactNode } from "react";

import ToastContainer from "../components/toast/ToastContainer";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    showToast: (type: ToastType, message: string) => void;
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_DURATION = 4000;

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const idCounterRef = useRef(0);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(
        (type: ToastType, message: string) => {
            const id = ++idCounterRef.current;

            setToasts((prev) => [
                ...prev,
                {
                    id,
                    type,
                    message,
                },
            ]);

            setTimeout(() => {
                removeToast(id);
            }, TOAST_DURATION);
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}

            <ToastContainer
                toasts={toasts}
                onDismiss={removeToast}
            />
        </ToastContext.Provider>
    );
}

export function useToastContext() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error(
            "useToastContext precisa ser usado dentro de um ToastProvider"
        );
    }

    return context;
}