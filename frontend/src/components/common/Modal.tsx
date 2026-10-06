import {
  X,
} from "lucide-react";

import type {
  ReactNode,
} from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-950">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}