import { APP_VERSION } from "../../../../shared/config";

interface Props {
  message: string;
  count?: number | null;
  loading?: boolean;
}

export function Statusbar({ message, count, loading }: Props) {
  return (
    <footer id="statusbar">
      <span className="statusbar-message">{message}</span>
      <span className="statusbar-center">
        {loading && <progress aria-label="Opération en cours" />}
      </span>
      <span className="statusbar-right">
        {count != null && <span>{count} résultat{count !== 1 ? "s" : ""}</span>}
        <span className="statusbar-version">v{APP_VERSION}</span>
      </span>
    </footer>
  );
}
