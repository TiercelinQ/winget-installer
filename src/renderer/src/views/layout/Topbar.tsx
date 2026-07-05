import type { Preferences } from "../../../../shared/types";
import LABELS from "../../i18n/fr.json";
import logoUrl from "../../assets/icon.png";

export type TabId = Preferences["startupTab"];

const TABS: { id: TabId | "settings"; label: string; icon: string }[] = [
  { id: "catalog", label: LABELS.nav.catalog, icon: "fa-magnifying-glass" },
  { id: "installed", label: LABELS.nav.installed, icon: "fa-box-open" },
  { id: "updates", label: LABELS.nav.updates, icon: "fa-circle-up" },
  { id: "favorites", label: LABELS.nav.favorites, icon: "fa-star" },
  { id: "settings", label: LABELS.nav.settings, icon: "fa-gear" },
];

interface Props {
  activeTab: TabId | "settings";
  onTabChange: (id: TabId | "settings") => void;
}

export function Topbar({ activeTab, onTabChange }: Props) {
  return (
    <header id="topbar">
      <div className="topbar-brand">
        <img src={logoUrl} alt="" className="topbar-logo" aria-hidden="true" />
        <span className="topbar-name">WinGet Hub</span>
      </div>

      <nav id="topbar-tabs" aria-label={LABELS.nav.ariaLabel}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab${activeTab === tab.id ? " is-active" : ""}`}
            onClick={() => onTabChange(tab.id)}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            <i className={`fa-solid ${tab.icon} icon icon-md`} aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
