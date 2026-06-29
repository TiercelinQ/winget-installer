import { useState, useCallback, useRef, useEffect } from "react";

type InstallState = "idle" | "running" | "done" | "error" | "cancelled";

interface UseInstallResult {
  state: InstallState;
  logs: string[];
  start: (ids: string[]) => Promise<InstallState>;
  cancel: () => Promise<void>;
  reset: () => void;
}

/** State machine for the installation flow, streaming logs from the main process. */
export function useInstall(): UseInstallResult {
  const [state, setState] = useState<InstallState>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      unsubRef.current?.();
    };
  }, []);

  const start = useCallback(async (ids: string[]): Promise<InstallState> => {
    setState("running");
    setLogs([]);

    const unsub = window.api.onInstallLog((line) => {
      setLogs((prev) => [...prev, line]);
    });
    unsubRef.current = unsub;

    const result = await window.api.installPackages(ids);
    unsub();
    unsubRef.current = null;

    if (result.ok) {
      setState("done");
      return "done";
    } else {
      setState("error");
      setLogs((prev) => [...prev, `Erreur : ${result.error.message}`]);
      return "error";
    }
  }, []);

  const cancel = useCallback(async () => {
    await window.api.cancelInstall();
    setState("cancelled");
    unsubRef.current?.();
    unsubRef.current = null;
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setLogs([]);
  }, []);

  return { state, logs, start, cancel, reset };
}
