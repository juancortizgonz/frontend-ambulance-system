import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  pushToast: (t: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const toast: Toast = {
      id: Date.now().toString(),
      title: t.title,
      message: t.message,
      type: t.type || "info",
      duration: typeof t.duration === "number" ? t.duration : 5000,
    };
    setToasts((s) => [toast, ...s]);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        setToasts((s) => s.filter((x) => x.id !== toast.id));
      }, toast.duration);
    }
    return toast.id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((s) => s.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const iconForType = (type: ToastType) => {
  switch (type) {
    case "success":
      return "✓";
    case "error":
      return "✕";
    case "warning":
      return "!";
    default:
      return "i";
  }
};

const bgForType = (type: ToastType) => {
  switch (type) {
    case "success":
      return "bg-green-50 border-green-200";
    case "error":
      return "bg-red-50 border-red-200";
    case "warning":
      return "bg-yellow-50 border-yellow-200";
    default:
      return "bg-blue-50 border-blue-200";
  }
};

const textColorForType = (type: ToastType) => {
  switch (type) {
    case "success":
      return "text-green-800";
    case "error":
      return "text-red-800";
    case "warning":
      return "text-yellow-800";
    default:
      return "text-blue-800";
  }
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const { type = "info", title, message } = toast;

  return (
    <div
      role="alert"
      className={`w-96 max-w-full ${bgForType(type)} border rounded-lg shadow-sm p-3 flex items-start gap-3`}
    >
      <div className={`flex-shrink-0 rounded-full w-8 h-8 flex items-center justify-center ${textColorForType(type)} bg-white/0 font-bold`}>
        <span className="select-none text-sm">{iconForType(type)}</span>
      </div>
      <div className="flex-1">
        {title && <div className="font-semibold text-sm mb-1">{title}</div>}
        <div className="text-sm text-gray-700">{message}</div>
      </div>
      <div className="ml-3 flex items-start">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-sm"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
