import { useState, useCallback, useMemo } from "react";
import type { PackageInfo, Favorite } from "../../../shared/types";
import { truncateText, formatVersion, sortByName } from "../utils/helpers";
import { CATALOG_CATEGORIES } from "../data/catalog";
import LABELS from "../i18n/fr.json";

interface Props {
  favorites: Favorite[];
  onOpenDrawer: (pkg: PackageInfo) => void;
  onInstall: (ids: string[]) => void;
  onAddFavorite: (pkg: PackageInfo) => void;
  onRemoveFavorite: (id: string) => void;
  onStatusChange: (msg: string, count?: number | null, loading?: boolean) => void;
}

const CATEGORY_LABELS = LABELS.categories as Record<string, string>;

export function CatalogView({
  favorites,
  onOpenDrawer,
  onInstall,
  onAddFavorite,
  onRemoveFavorite,
  onStatusChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PackageInfo[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState<"browse" | "search">("browse");
  const [activeCategory, setActiveCategory] = useState(0);
  const [sortAsc, setSortAsc] = useState(true);

  const sortedResults = useMemo(() => sortByName(results, sortAsc), [results, sortAsc]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    setMode("search");
    setSelected(new Set());
    onStatusChange(LABELS.status.searching, null, true);

    const result = await window.api.searchPackages(query.trim());
    setSearching(false);

    if (!result.ok) {
      onStatusChange(LABELS.status.ready);
      return;
    }

    setResults(result.data);
    onStatusChange(LABELS.status.ready, result.data.length);
  }, [query, onStatusChange]);

  const selectCategory = useCallback((index: number) => {
    setActiveCategory(index);
    setMode("browse");
    setSelected(new Set());
    onStatusChange(LABELS.status.ready);
  }, [onStatusChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === results.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(results.map((p) => p.id)));
    }
  };

  const handleInstallSelected = () => {
    if (selected.size === 0) return;
    onInstall([...selected]);
  };

  const isFavorite = (id: string) => favorites.some((f) => f.id === id);

  const toggleFavorite = (pkg: PackageInfo) => {
    if (isFavorite(pkg.id)) onRemoveFavorite(pkg.id);
    else onAddFavorite(pkg);
  };

  const allSelected = results.length > 0 && selected.size === results.length;

  const category = CATALOG_CATEGORIES[activeCategory];

  return (
    <div className="view-catalog">
      <div className="section-header">
        <h1 className="section-title">{LABELS.nav.catalog}</h1>
        <p className="section-subtitle">{LABELS.catalog.subtitle}</p>
      </div>

      <div className="search-bar">
        <input
          type="search"
          className="search-input"
          placeholder={LABELS.catalog.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={LABELS.catalog.searchLabel}
          disabled={searching}
        />
        <button
          className="btn btn-primary btn-md"
          onClick={handleSearch}
          disabled={searching}
        >
          <i className="fa-solid fa-magnifying-glass icon icon-md" aria-hidden="true" />
          {LABELS.actions.search}
        </button>
      </div>

      <nav className="category-bar" aria-label={LABELS.catalog.categoriesLabel}>
        {CATALOG_CATEGORIES.map((cat, i) => (
          <button
            key={cat.labelKey}
            className={`category-chip${mode === "browse" && activeCategory === i ? " is-active" : ""}`}
            onClick={() => selectCategory(i)}
            aria-current={mode === "browse" && activeCategory === i ? "true" : undefined}
          >
            <i className={`fa-solid ${cat.icon} icon icon-md`} aria-hidden="true" />
            {CATEGORY_LABELS[cat.labelKey]}
          </button>
        ))}
      </nav>

      {mode === "browse" ? (
        <div className="category-grid" aria-label={LABELS.catalog.categoryGridLabel}>
          {category.packages.map((pkg) => {
            const fav = isFavorite(pkg.id);
            const pkgInfo: PackageInfo = { id: pkg.id, name: pkg.name, version: "", publisher: "", source: "winget" };
            return (
              <div className="package-card" key={pkg.id}>
                <button className="package-card-info" onClick={() => onOpenDrawer(pkgInfo)}>
                  <span className="package-card-name">{pkg.name}</span>
                  <code className="package-card-id">{pkg.id}</code>
                </button>
                <div className="package-card-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => onInstall([pkg.id])}>
                    <i className="fa-solid fa-download icon icon-md" aria-hidden="true" />
                    {LABELS.actions.install}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => toggleFavorite(pkgInfo)}
                    aria-label={fav ? LABELS.actions.removeFromFavorites : LABELS.actions.addToFavorites}
                    title={fav ? LABELS.actions.removeFromFavorites : LABELS.actions.addToFavorites}
                  >
                    <i
                      className={`${fav ? "fa-solid icon-active" : "fa-regular"} fa-star icon icon-md`}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {results.length > 0 && (
            <>
              <div className="catalog-toolbar">
                <button
                  className="btn btn-primary btn-md"
                  onClick={handleInstallSelected}
                  disabled={selected.size === 0}
                >
                  <i className="fa-solid fa-download icon icon-md" aria-hidden="true" />
                  {LABELS.actions.installSelected} ({selected.size})
                </button>
                <button className="btn btn-ghost btn-md" onClick={() => selectCategory(activeCategory)}>
                  <i className="fa-solid fa-arrow-left icon icon-md" aria-hidden="true" />
                  {LABELS.catalog.backToCategories}
                </button>
              </div>

              <table className="data-table" aria-label={LABELS.catalog.resultsLabel}>
                <thead>
                  <tr>
                    <th className="col-checkbox">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        aria-label={LABELS.catalog.selectAll}
                      />
                    </th>
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
                    <th>{LABELS.pkg.version}</th>
                    <th>{LABELS.pkg.publisher}</th>
                    <th>{LABELS.pkg.source}</th>
                    <th className="col-actions">{LABELS.pkg.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((pkg, i) => {
                    const fav = isFavorite(pkg.id);
                    return (
                      <tr
                        key={`${pkg.id}-${i}`}
                        className={`is-clickable${selected.has(pkg.id) ? " is-selected" : ""}`}
                        onClick={() => onOpenDrawer(pkg)}
                      >
                        <td
                          className="col-checkbox"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selected.has(pkg.id)}
                            onChange={() => toggleSelect(pkg.id)}
                            aria-label={`${LABELS.catalog.select} ${pkg.name}`}
                          />
                        </td>
                        <td>
                          <span className="pkg-name">{truncateText(pkg.name, 40)}</span>
                        </td>
                        <td><code>{pkg.id}</code></td>
                        <td>{formatVersion(pkg.version)}</td>
                        <td>{truncateText(pkg.publisher, 30)}</td>
                        <td>{pkg.source}</td>
                        <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => toggleFavorite(pkg)}
                            aria-label={fav ? LABELS.actions.removeFromFavorites : LABELS.actions.addToFavorites}
                            title={fav ? LABELS.actions.removeFromFavorites : LABELS.actions.addToFavorites}
                          >
                            <i
                              className={`${fav ? "fa-solid icon-active" : "fa-regular"} fa-star icon icon-md`}
                              aria-hidden="true"
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}

          {results.length === 0 && !searching && query && (
            <p className="empty-state">{LABELS.catalog.noResults}</p>
          )}
        </>
      )}
    </div>
  );
}
