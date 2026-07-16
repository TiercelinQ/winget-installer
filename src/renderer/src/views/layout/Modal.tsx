import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import LABELS from "../../i18n/fr.json";

type InstallState = "idle" | "running" | "done" | "error" | "cancelled";

interface Props {
  isOpen: boolean;
  state: InstallState;
  logs: string[];
  onCancel: () => void;
  onClose: () => void;
}

export function Modal({ isOpen, state, logs, onCancel, onClose }: Props) {
  const logRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state !== "running") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, state, onClose]);

  if (!isOpen) return null;

  const isRunning = state === "running";
  const isDone = state !== "running" && state !== "idle";

  return (
    <div
      className="modal-overlay"
      onClick={isDone ? onClose : undefined}
      aria-hidden="false"
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={LABELS.install.modalTitle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-title">
            {state === "done" && LABELS.install.done}
            {state === "error" && LABELS.install.error}
            {state === "cancelled" && LABELS.install.cancelled}
            {(state === "running" || state === "idle") && LABELS.install.modalTitle}
          </span>
          {isDone && (
            <button className="btn-ghost" onClick={onClose} aria-label={LABELS.actions.close}>
              <X className="icon icon-lg" strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="modal-content">
          <pre className="log-output" ref={logRef} aria-live="polite" aria-atomic="false">
            {logs.join("\n")}
          </pre>
        </div>

        <div className="modal-footer">
          {isRunning ? (
            <button className="btn btn-danger btn-md" onClick={onCancel}>
              {LABELS.actions.cancel}
            </button>
          ) : (
            <button className="btn btn-primary btn-md" onClick={onClose}>
              {LABELS.actions.close}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
