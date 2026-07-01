import { useState, useMemo } from "react";
import type { Favorite, PackageInfo } from "../../../shared/types";
import { truncateText, sortByName } from "../utils/helpers";
import { CATALOG_CATEGORIES } from "../data/catalog";
import LABELS from "../i18n/fr.json";

interface Props {
  favorites: Favorite[];
  onOpenDrawer: (pkg: PackageInfo) => void;
  onRemoveFavorite: (id: string) => void;
  onInstall: (ids: string[]) => void;
}

const CATEGORY_LABELS = LABELS.categories as Record<string, string>;

/** Map a curated package id to its category labelKey (favorites added from search have none). */
const CATEGORY_BY_ID = new Map<string, string>(
  CATALOG_CATEGORIES.flatMap((cat) => cat.packages.map((p) => [p.id, cat.labelKey] as const)),
);

function categoryOf(id: string): string {
  const key = CATEGORY_BY_ID.get(id);
  return key ? CATEGORY_LABELS[key] : "—";
}

export function FavoritesView({ favorites, onOpenDrawer, onRemoveFavorite, onInstall }: Props) {
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = useMemo(() => sortByName(favorites, sortAsc), [favorites, sortAsc]);

  const toPackageInfo = (f: Favorite): PackageInfo => ({
    id: f.id,
    name: f.name,
    publisher: f.publisher,
    version: f.version,
    source: "winget",
  });

  return (
    <div className="view-favorites">
      <div className="section-header">
        <h1 className="section-title">{LABELS.nav.favorites}</h1>
        <p className="section-subtitle">{LABELS.favorites.subtitle}</p>
      </div>

      {favorites.length > 0 ? (
        <>
          <div className="view-toolbar">
            <button
              className="btn btn-primary btn-md"
              onClick={() => onInstall(favorites.map((f) => f.id))}
            >
              <i className="fa-solid fa-download icon icon-md" aria-hidden="true" />
              {LABELS.actions.installAllFavorites} ({favorites.length})
            </button>
          </div>

          <table className="data-table" aria-label={LABELS.favorites.tableLabel}>
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
              <th>{LABELS.pkg.category}</th>
              <th>{LABELS.pkg.publisher}</th>
              <th>{LABELS.pkg.version}</th>
              <th>{LABELS.pkg.actions}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((fav) => (
              <tr
                key={fav.id}
                className="is-clickable"
                onClick={() => onOpenDrawer(toPackageInfo(fav))}
              >
                <td>{truncateText(fav.name, 40)}</td>
                <td><code>{fav.id}</code></td>
                <td>{categoryOf(fav.id)}</td>
                <td>{truncateText(fav.publisher, 30)}</td>
                <td>{fav.version || "—"}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="btn-group">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onInstall([fav.id])}
                    >
                      <i className="fa-solid fa-download icon icon-md" aria-hidden="true" />
                      {LABELS.actions.install}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onRemoveFavorite(fav.id)}
                      aria-label={`${LABELS.actions.removeFromFavorites} ${fav.name}`}
                    >
                      <i className="fa-solid fa-trash icon icon-md" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </>
      ) : (
        <p className="empty-state">{LABELS.favorites.empty}</p>
      )}
    </div>
  );
}
