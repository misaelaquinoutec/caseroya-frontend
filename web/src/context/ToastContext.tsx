import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, 'warning'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const styles = {
            success: 'bg-emerald-600 text-white shadow-emerald-200',
            error: 'bg-rose-600 text-white shadow-rose-200',
            warning: 'bg-amber-500 text-white shadow-amber-200',
            info: 'bg-slate-800 text-white shadow-slate-200',
          };

          const icons = {
            success: <CheckCircle2 className="w-5 h-5 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 shrink-0" />,
            info: <Info className="w-5 h-5 shrink-0" />,
          };

          return (
            <div
              key={toast.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all pointer-events-auto animate-in slide-in-from-bottom-2 duration-200 ${styles[toast.type]}`}
            >
              {icons[toast.type]}
              <span className="flex-1 leading-snug">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 opacity-80 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
