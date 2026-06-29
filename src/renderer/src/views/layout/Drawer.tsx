import { useEffect } from "react";
import type { PackageInfo, Favorite } from "../../../../shared/types";
import LABELS from "../../i18n/fr.json";

interface Props {
  pkg: PackageInfo | null;
  favorite: Favorite | null;
  isOpen: boolean;
  onClose: () => void;
  onInstall: (id: string) => void;
  onAddFavorite: (pkg: PackageInfo) => void;
  onRemoveFavorite: (id: string) => void;
}

export function Drawer({ pkg, favorite, isOpen, onClose, onInstall, onAddFavorite, onRemoveFavorite }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const isFavorite = !!favorite;

  return (
    <>
      {isOpen && (
        <div
          className="drawer-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        id="drawer"
        className={isOpen ? "is-open" : ""}
        aria-label={LABELS.drawer.ariaLabel}
        aria-hidden={!isOpen}
      >
        <div className="drawer-header">
          <span className="drawer-title">{pkg?.name ?? LABELS.drawer.title}</span>
          <button
            className="btn-ghost"
            onClick={onClose}
            aria-label={LABELS.drawer.close}
          >
            <i className="fa-solid fa-xmark icon icon-lg" aria-hidden="true" />
          </button>
        </div>

        {pkg && (
          <div className="drawer-content">
            <div className="package-detail">
              <div className="package-detail-row">
                <span className="package-detail-label">{LABELS.pkg.id}</span>
                <code className="package-detail-value">{pkg.id}</code>
              </div>
              <div className="package-detail-row">
                <span className="package-detail-label">{LABELS.pkg.publisher}</span>
                <span className="package-detail-value">{pkg.publisher || "—"}</span>
              </div>
              <div className="package-detail-row">
                <span className="package-detail-label">{LABELS.pkg.version}</span>
                <span className="package-detail-value">{pkg.version || "—"}</span>
              </div>
              <div className="package-detail-row">
                <span className="package-detail-label">{LABELS.pkg.source}</span>
                <span className="package-detail-value">{pkg.source}</span>
              </div>
            </div>

            <div className="drawer-actions">
              <button
                className="btn btn-primary btn-md"
                onClick={() => onInstall(pkg.id)}
              >
                <i className="fa-solid fa-download icon icon-md" aria-hidden="true" />
                {LABELS.actions.install}
              </button>

              {isFavorite ? (
                <button
                  className="btn btn-secondary btn-md"
                  onClick={() => onRemoveFavorite(pkg.id)}
                >
                  <i className="fa-solid fa-star icon icon-md" aria-hidden="true" />
                  {LABELS.actions.removeFromFavorites}
                </button>
              ) : (
                <button
                  className="btn btn-secondary btn-md"
                  onClick={() => onAddFavorite(pkg)}
                >
                  <i className="fa-regular fa-star icon icon-md" aria-hidden="true" />
                  {LABELS.actions.addToFavorites}
                </button>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
