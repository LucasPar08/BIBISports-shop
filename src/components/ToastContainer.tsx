import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { Toast } from '../types';

const icons: Record<Toast['type'], React.ReactNode> = {
  success: <CheckCircle size={18} className="text-emerald-400 shrink-0" />,
  error: <XCircle size={18} className="text-red-400 shrink-0" />,
  info: <Info size={18} className="text-blue-400 shrink-0" />,
};

const borders: Record<Toast['type'], string> = {
  success: 'border-l-emerald-500',
  error: 'border-l-red-500',
  info: 'border-l-blue-500',
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 bg-slate-800 border border-slate-700 border-l-4 ${borders[t.type]} rounded-xl px-4 py-3 shadow-2xl min-w-[260px] max-w-sm animate-toast-in`}
        >
          {icons[t.type]}
          <span className="text-sm text-slate-100 flex-1">{t.message}</span>
          <button
            onClick={() => dismissToast(t.id)}
            className="text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
