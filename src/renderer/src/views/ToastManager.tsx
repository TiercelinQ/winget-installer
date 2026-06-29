import type { Toast } from "../hooks/useToast";

const ICONS: Record<string, string> = {
  success: "fa-circle-check",
  warning: "fa-triangle-exclamation",
  danger: "fa-circle-exclamation",
  info: "fa-circle-info",
};

interface Props {
  toasts: Toast[];
  dismiss: (id: number) => void;
}

export function ToastManager({ toasts, dismiss }: Props) {
  return (
    <div id="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} role="alert">
          <i className={`fa-solid ${ICONS[t.type]} icon icon-md`} aria-hidden="true" />
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
              <i className="fa-solid fa-xmark icon icon-md" aria-hidden="true" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
