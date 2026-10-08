import React from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

export interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';

        return (
          <div
            key={t.id}
            className="pointer-events-auto glass p-3.5 rounded-[4px] border border-[rgba(201,168,76,0.3)] shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-top-4"
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-4 h-4 text-[#C0392B] shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="w-4 h-4 text-[#8a6e2a] shrink-0 mt-0.5" />}

            <div className="flex-1">
              {t.title && <div className="text-xs font-mono font-semibold text-[#f5f3f0]">{t.title}</div>}
              <div className="text-xs text-[#c4c0bb] font-sans leading-relaxed">{t.message}</div>
            </div>

            <button
              onClick={() => onDismiss(t.id)}
              className="text-[#8a6e2a] hover:text-[#f5f3f0] p-0.5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
