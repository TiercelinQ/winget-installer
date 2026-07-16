import { useState, useEffect, useCallback, useMemo } from "react";
import { RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import type { InstalledPackage } from "../../../shared/types";
import { truncateText, sortByName } from "../utils/helpers";
import LABELS from "../i18n/fr.json";

interface Props {
  onStatusChange: (msg: string, count?: number | null, loading?: boolean) => void;
}

export function InstalledView({ onStatusChange }: Props) {
  const [packages, setPackages] = useState<InstalledPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    onStatusChange(LABELS.status.loading, null, true);
    const result = await window.api.listInstalled();
    setLoading(false);

    if (!result.ok) {
      onStatusChange(LABELS.status.ready);
      return;
    }

    setPackages(result.data);
    onStatusChange(LABELS.status.ready, result.data.length);
  }, [onStatusChange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const displayed = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const filtered = packages.filter(
      (p) => !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q),
    );
    return sortByName(filtered, sortAsc);
  }, [packages, filter, sortAsc]);

  return (
    <div className="view-installed">
      <div className="section-header">
        <h1 className="section-title">{LABELS.nav.installed}</h1>
        <p className="section-subtitle">{LABELS.installed.subtitle}</p>
      </div>

      <div className="view-toolbar">
        <button className="btn btn-secondary btn-md" onClick={load} disabled={loading}>
          <RefreshCw className="icon icon-md" strokeWidth={1.75} aria-hidden="true" />
          {LABELS.actions.refresh}
        </button>
        <input
          type="search"
          className="search-input"
          placeholder={LABELS.installed.filterPlaceholder}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label={LABELS.installed.filterLabel}
        />
      </div>

      {packages.length === 0 ? (
        !loading && <p className="empty-state">{LABELS.installed.empty}</p>
      ) : displayed.length === 0 ? (
        <p className="empty-state">{LABELS.installed.noMatch}</p>
      ) : (
        <table className="data-table" aria-label={LABELS.installed.tableLabel}>
          <thead>
            <tr>
              <th>
                <button
                  className="th-sort"
                  onClick={() => setSortAsc((s) => !s)}
                  aria-label={LABELS.pkg.sortByName}
                >
                  {LABELS.pkg.name}
                  {sortAsc ? (
                    <ChevronUp className="icon icon-sm" strokeWidth={1.75} aria-hidden="true" />
                  ) : (
                    <ChevronDown className="icon icon-sm" strokeWidth={1.75} aria-hidden="true" />
                  )}
                </button>
              </th>
              <th>{LABELS.pkg.id}</th>
              <th>{LABELS.installed.installedVersion}</th>
              <th>{LABELS.installed.availableVersion}</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((pkg, i) => (
              <tr key={`${pkg.id}-${pkg.installedVersion}-${i}`}>
                <td>{truncateText(pkg.name, 40)}</td>
                <td><code>{pkg.id}</code></td>
                <td>{pkg.installedVersion || "—"}</td>
                <td>
                  {pkg.availableVersion ? (
                    <span className="badge-update">{pkg.availableVersion}</span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
