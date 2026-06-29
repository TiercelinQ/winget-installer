import { useState, useCallback } from "react";
import type { ToastType } from "../../../shared/types";

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  description?: string;
}

let nextId = 0;

const DURATIONS: Record<ToastType, number | null> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  danger: null, // persistent
};

/** Manages a queue of toasts. */
export function useToast(): {
  toasts: Toast[];
  toast: (payload: { type: ToastType; message: string; description?: string }) => void;
  dismiss: (id: number) => void;
} {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (payload: { type: ToastType; message: string; description?: string }) => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, ...payload }]);

      const duration = DURATIONS[payload.type];
      if (duration !== null) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  return { toasts, toast, dismiss };
}
