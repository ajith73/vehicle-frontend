import { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  requireInput?: boolean;
  inputPlaceholder?: string;
  onConfirm: (inputValue?: string) => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  requireInput = false,
  inputPlaceholder = 'Enter details...',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: <Trash2 size={32} />,
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      buttonBg: 'bg-destructive',
      buttonHover: 'hover:bg-destructive/90',
      buttonText: 'text-destructive-foreground',
      shadow: 'shadow-destructive/20',
    },
    warning: {
      icon: <AlertTriangle size={32} />,
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500',
      buttonBg: 'bg-yellow-500',
      buttonHover: 'hover:bg-yellow-600',
      buttonText: 'text-white',
      shadow: 'shadow-yellow-500/20',
    },
    info: {
      icon: <Info size={32} />,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      buttonBg: 'bg-blue-500',
      buttonHover: 'hover:bg-blue-600',
      buttonText: 'text-white',
      shadow: 'shadow-blue-500/20',
    },
    success: {
      icon: <CheckCircle size={32} />,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      buttonBg: 'bg-green-500',
      buttonHover: 'hover:bg-green-600',
      buttonText: 'text-white',
      shadow: 'shadow-green-500/20',
    },
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-center">
        <div className={`w-16 h-16 ${config.iconBg} ${config.iconColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {config.icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm mb-6 whitespace-pre-line">
          {message}
        </p>
        
        {requireInput && (
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={inputPlaceholder}
            className="w-full bg-background border border-border rounded-xl p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none"
          />
        )}

        <div className="flex gap-3">
          <button 
            onClick={() => {
              setInputValue('');
              onCancel();
            }}
            className="flex-1 py-2.5 rounded-xl font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            disabled={requireInput && !inputValue.trim()}
            onClick={() => {
              onConfirm(inputValue);
              setInputValue('');
              onCancel();
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold ${config.buttonBg} ${config.buttonText} ${config.buttonHover} transition-colors shadow-lg ${config.shadow} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
