import { useState, useEffect, useCallback, useMemo } from "react";
import type { UpgradeInfo } from "../../../shared/types";
import { truncateText, sortByName } from "../utils/helpers";
import LABELS from "../i18n/fr.json";

interface Props {
  onInstallSingle: (id: string) => void;
  onStatusChange: (msg: string, count?: number | null, loading?: boolean) => void;
}

export function UpdatesView({ onInstallSingle, onStatusChange }: Props) {
  const [upgrades, setUpgrades] = useState<UpgradeInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = useMemo(() => sortByName(upgrades, sortAsc), [upgrades, sortAsc]);

  const load = useCallback(async () => {
    setLoading(true);
    onStatusChange(LABELS.status.loading, null, true);
    const result = await window.api.listUpgrades();
    setLoading(false);

    if (!result.ok) {
      onStatusChange(LABELS.status.ready);
      return;
    }

    setUpgrades(result.data);
    onStatusChange(LABELS.status.ready, result.data.length);
  }, [onStatusChange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div className="view-updates">
      <div className="section-header">
        <h1 className="section-title">{LABELS.nav.updates}</h1>
        <p className="section-subtitle">{LABELS.updates.subtitle}</p>
      </div>

      <div className="view-toolbar">
        <button className="btn btn-secondary btn-md" onClick={load} disabled={loading}>
          <i className="fa-solid fa-rotate-right icon icon-md" aria-hidden="true" />
          {LABELS.actions.refresh}
        </button>
      </div>

      {upgrades.length > 0 ? (
        <table className="data-table" aria-label={LABELS.updates.tableLabel}>
          <thead>
            <tr>
              <th>
                <button
                  className="th-sort"
                  onClick={() => setSortAsc((s) => !s)}
                  aria-label={LABELS.pkg.sortByName}
                >
                  {LABELS.pkg.name}
                  <i
                    className={`fa-solid ${sortAsc ? "fa-sort-up" : "fa-sort-down"} icon icon-sm`}
                    aria-hidden="true"
                  />
                </button>
              </th>
              <th>{LABELS.pkg.id}</th>
              <th>{LABELS.installed.installedVersion}</th>
              <th>{LABELS.updates.availableVersion}</th>
              <th>{LABELS.pkg.actions}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((pkg, i) => (
              <tr key={`${pkg.id}-${pkg.availableVersion}-${i}`}>
                <td>{truncateText(pkg.name, 40)}</td>
                <td><code>{pkg.id}</code></td>
                <td>{pkg.installedVersion}</td>
                <td><span className="badge-update">{pkg.availableVersion}</span></td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onInstallSingle(pkg.id)}
                  >
                    <i className="fa-solid fa-arrow-up icon icon-md" aria-hidden="true" />
                    {LABELS.actions.update}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p className="empty-state">{LABELS.updates.empty}</p>
      )}
    </div>
  );
}
