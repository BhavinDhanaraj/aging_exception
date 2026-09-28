import React from 'react';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'warn' | 'info';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-5 right-5 z-[500] flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map(toast => {
        let bg = 'bg-[#2C5A1E] text-white';
        if (toast.type === 'success') bg = 'bg-[#1E7A3D] text-white';
        if (toast.type === 'warn') bg = 'bg-[#B96A00] text-white';

        return (
          <div
            key={toast.id}
            onClick={() => onDismiss(toast.id)}
            className={`${bg} px-4 py-3 rounded-lg text-xs leading-relaxed shadow-lg flex items-center justify-between gap-3 pointer-events-auto cursor-pointer animate-slideIn`}
          >
            <div dangerouslySetInnerHTML={{ __html: toast.message }} />
            <button
              onClick={e => {
                e.stopPropagation();
                onDismiss(toast.id);
              }}
              className="text-white/80 hover:text-white font-bold ml-2 text-sm leading-none"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
};
