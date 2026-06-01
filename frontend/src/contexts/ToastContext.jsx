import React, { createContext, useContext, useState, useCallback } from 'react';

export const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`animate-slide-up pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-medium text-sm min-w-[280px] max-w-[380px] ${
              toast.type === 'success'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : toast.type === 'error'
                ? 'bg-gradient-to-r from-red-500 to-rose-500'
                : 'bg-gradient-to-r from-primary to-secondary'
            }`}
          >
            <span className="text-xl flex-shrink-0">
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : ''}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
