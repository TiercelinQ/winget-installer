import { CircleCheck, TriangleAlert, CircleX, Info, X, type LucideIcon } from "lucide-react";
import type { Toast } from "../hooks/useToast";

const ICONS: Record<string, LucideIcon> = {
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleX,
  info: Info,
};

interface Props {
  toasts: Toast[];
  dismiss: (id: number) => void;
}

export function ToastManager({ toasts, dismiss }: Props) {
  return (
    <div id="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div key={t.id} className={`toast toast-${t.type}`} role="alert">
            <Icon className="icon icon-md" strokeWidth={1.75} aria-hidden="true" />
            <div className="toast-body">
              <span className="toast-message">{t.message}</span>
              {t.description && <span className="toast-description">{t.description}</span>}
            </div>
            {(t.type === "warning" || t.type === "danger") && (
              <button
                className="toast-close btn-ghost"
                onClick={() => dismiss(t.id)}
                aria-label="Fermer"
              >
                <X className="icon icon-md" strokeWidth={1.75} aria-hidden="true" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
