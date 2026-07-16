import { FileDown, FileUp } from "lucide-react";
import type { Preferences } from "../../../shared/types";
import LABELS from "../i18n/fr.json";

interface Props {
  preferences: Preferences;
  onSetPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => Promise<void>;
  onImportFavorites: () => void;
  onExportFavorites: () => void;
}

export function SettingsView({ preferences, onSetPreference, onImportFavorites, onExportFavorites }: Props) {
  return (
    <div className="view-settings">
      <div className="section-header">
        <h1 className="section-title">{LABELS.nav.settings}</h1>
        <p className="section-subtitle">{LABELS.settings.subtitle}</p>
      </div>

      <div className="settings-form">
        <div className="field">
          <label htmlFor="setting-theme">{LABELS.settings.theme}</label>
          <select
            id="setting-theme"
            value={preferences.theme}
            onChange={(e) =>
              onSetPreference("theme", e.target.value as Preferences["theme"])
            }
          >
            <option value="system">{LABELS.settings.themeSystem}</option>
            <option value="light">{LABELS.settings.themeLight}</option>
            <option value="dark">{LABELS.settings.themeDark}</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="setting-startup-tab">{LABELS.settings.startupTab}</label>
          <select
            id="setting-startup-tab"
            value={preferences.startupTab}
            onChange={(e) =>
              onSetPreference("startupTab", e.target.value as Preferences["startupTab"])
            }
          >
            <option value="catalog">{LABELS.nav.catalog}</option>
            <option value="installed">{LABELS.nav.installed}</option>
            <option value="updates">{LABELS.nav.updates}</option>
            <option value="favorites">{LABELS.nav.favorites}</option>
          </select>
        </div>

        <div className="field">
          <label>{LABELS.settings.favorites}</label>
          <p className="field-help">{LABELS.settings.favoritesHelp}</p>
          <div className="btn-group">
            <button className="btn btn-secondary btn-md" onClick={onImportFavorites}>
              <FileDown className="icon icon-md" strokeWidth={1.75} aria-hidden="true" />
              {LABELS.settings.importFavorites}
            </button>
            <button className="btn btn-secondary btn-md" onClick={onExportFavorites}>
              <FileUp className="icon icon-md" strokeWidth={1.75} aria-hidden="true" />
              {LABELS.settings.exportFavorites}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
