import { useEffect, useRef } from "react";
import { Search, PackageOpen, CircleArrowUp, Star, Settings, type LucideIcon } from "lucide-react";
import type { Preferences } from "../../../../shared/types";
import LABELS from "../../i18n/fr.json";
import logoUrl from "../../assets/icon.png";

export type TabId = Preferences["startupTab"];

const TABS: { id: TabId | "settings"; label: string; icon: LucideIcon }[] = [
  { id: "catalog", label: LABELS.nav.catalog, icon: Search },
  { id: "installed", label: LABELS.nav.installed, icon: PackageOpen },
  { id: "updates", label: LABELS.nav.updates, icon: CircleArrowUp },
  { id: "favorites", label: LABELS.nav.favorites, icon: Star },
  { id: "settings", label: LABELS.nav.settings, icon: Settings },
];

interface Props {
  activeTab: TabId | "settings";
  onTabChange: (id: TabId | "settings") => void;
}

/** Signature underline (design-system.md §8): write the two CSS variables the ::after reads. */
function placeUnderline(tabs: HTMLElement) {
  const active = tabs.querySelector<HTMLElement>(".is-active");
  if (!active) return;
  tabs.style.setProperty("--underline-x", `${active.offsetLeft}px`);
  tabs.style.setProperty("--underline-w", `${active.offsetWidth}px`);
}

export function Topbar({ activeTab, onTabChange }: Props) {
  const tabsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    placeUnderline(tabs);
    const onResize = () => placeUnderline(tabs);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeTab]);

  return (
    <header id="topbar">
      <div className="topbar-brand">
        <img src={logoUrl} alt="" className="topbar-logo" aria-hidden="true" />
        <span className="topbar-name">WinGet Hub</span>
      </div>

      <nav id="topbar-tabs" ref={tabsRef} aria-label={LABELS.nav.ariaLabel}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab${activeTab === tab.id ? " is-active" : ""}`}
              onClick={() => onTabChange(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              <Icon className="icon icon-md" strokeWidth={1.75} aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
