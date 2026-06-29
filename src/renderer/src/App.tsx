import { useState, useEffect, useCallback, Component, type ReactNode, type ErrorInfo } from "react";
import type { PackageInfo, Favorite, Preferences } from "../../shared/types";
import { Topbar, type TabId } from "./views/layout/Topbar";
import { Statusbar } from "./views/layout/Statusbar";
import { Drawer } from "./views/layout/Drawer";
import { Modal } from "./views/layout/Modal";
import { ToastManager } from "./views/ToastManager";
import { CatalogView } from "./views/CatalogView";
import { InstalledView } from "./views/InstalledView";
import { UpdatesView } from "./views/UpdatesView";
import { FavoritesView } from "./views/FavoritesView";
import { SettingsView } from "./views/SettingsView";
import { useTheme } from "./hooks/useTheme";
import { useToast } from "./hooks/useToast";
import { useInstall } from "./hooks/useInstall";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[WinGet Hub] Erreur non gérée:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "24px", color: "#DC2626" }}>
          Une erreur inattendue s&apos;est produite. Redémarrez l&apos;application.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [preferences, setPreferences] = useState<Preferences>({ theme: "system", startupTab: "catalog" });
  const [activeTab, setActiveTab] = useState<TabId | "settings">("catalog");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [drawerPkg, setDrawerPkg] = useState<PackageInfo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Prêt");
  const [statusCount, setStatusCount] = useState<number | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [, setAndPersistTheme] = useTheme(preferences.theme);
  const { toasts, toast, dismiss } = useToast();
  const { state: installState, logs, start: startInstall, cancel: cancelInstall, reset: resetInstall } = useInstall();

  useEffect(() => {
    (async () => {
      const [prefsResult, favsResult] = await Promise.all([
        window.api.getPreferences(),
        window.api.listFavorites(),
      ]);

      if (prefsResult.ok) {
        setPreferences(prefsResult.data);
        setActiveTab(prefsResult.data.startupTab);
        setAndPersistTheme(prefsResult.data.theme);
      }

      if (favsResult.ok) {
        setFavorites(favsResult.data);
      }
    })();
  }, [setAndPersistTheme]);

  const handleStatusChange = useCallback(
    (msg: string, count?: number | null, loading?: boolean) => {
      setStatusMsg(msg);
      setStatusCount(count ?? null);
      setStatusLoading(loading ?? false);
    },
    [],
  );

  const handleOpenDrawer = useCallback((pkg: PackageInfo) => {
    setDrawerPkg(pkg);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => setDrawerOpen(false), []);

  const handleInstall = useCallback(
    async (ids: string[]) => {
      setDrawerOpen(false);
      setModalOpen(true);
      resetInstall();
      const finalState = await startInstall(ids);

      if (finalState === "done") {
        toast({ type: "success", message: `${ids.length} paquet(s) installé(s) avec succès.` });
      }
    },
    [startInstall, resetInstall, toast],
  );

  const handleUpgradeOne = useCallback(
    async (id: string) => {
      setModalOpen(true);
      resetInstall();
      const finalState = await startInstall([id]);

      if (finalState === "done") {
        toast({ type: "success", message: `Mise à jour de ${id} effectuée.` });
      }
    },
    [startInstall, resetInstall, toast],
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    resetInstall();
  }, [resetInstall]);

  const handleAddFavorite = useCallback(
    async (pkg: PackageInfo) => {
      const result = await window.api.addFavorite(pkg);
      if (!result.ok) {
        toast(result.error);
        return;
      }
      setFavorites((prev) => [...prev, result.data]);
      toast({ type: "info", message: `« ${pkg.name} » ajouté aux favoris.` });
    },
    [toast],
  );

  const handleRemoveFavorite = useCallback(
    async (id: string) => {
      const result = await window.api.removeFavorite(id);
      if (!result.ok) {
        toast(result.error);
        return;
      }
      setFavorites((prev) => prev.filter((f) => f.id !== id));
      toast({ type: "info", message: "Retiré des favoris." });
    },
    [toast],
  );

  const handleExportFavorites = useCallback(async () => {
    const result = await window.api.exportFavorites();
    if (!result.ok) {
      toast(result.error);
      return;
    }
    if (result.data) toast({ type: "success", message: "Favoris exportés." });
  }, [toast]);

  const handleImportFavorites = useCallback(async () => {
    const result = await window.api.importFavorites();
    if (!result.ok) {
      toast(result.error);
      return;
    }
    if (result.data) {
      setFavorites(result.data);
      toast({ type: "success", message: `Favoris importés (${result.data.length} au total).` });
    }
  }, [toast]);

  const handleSetPreference = useCallback(
    async <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      if (key === "theme") await setAndPersistTheme(value as Preferences["theme"]);
      const result = await window.api.setPreference(key, value);
      if (!result.ok) {
        toast(result.error);
        return;
      }
      setPreferences((prev) => ({ ...prev, [key]: value }));
    },
    [setAndPersistTheme, toast],
  );

  const drawerFavorite = drawerPkg ? (favorites.find((f) => f.id === drawerPkg.id) ?? null) : null;

  return (
    <ErrorBoundary>
      <div id="app-shell">
        <Topbar activeTab={activeTab} onTabChange={setActiveTab} />

        <main id="main-content">
          {activeTab === "catalog" && (
            <CatalogView
              favorites={favorites}
              onOpenDrawer={handleOpenDrawer}
              onInstall={handleInstall}
              onAddFavorite={handleAddFavorite}
              onRemoveFavorite={handleRemoveFavorite}
              onStatusChange={handleStatusChange}
            />
          )}
          {activeTab === "installed" && (
            <InstalledView onStatusChange={handleStatusChange} />
          )}
          {activeTab === "updates" && (
            <UpdatesView
              onInstallSingle={handleUpgradeOne}
              onStatusChange={handleStatusChange}
            />
          )}
          {activeTab === "favorites" && (
            <FavoritesView
              favorites={favorites}
              onOpenDrawer={handleOpenDrawer}
              onRemoveFavorite={handleRemoveFavorite}
              onInstall={handleInstall}
            />
          )}
          {activeTab === "settings" && (
            <SettingsView
              preferences={preferences}
              onSetPreference={handleSetPreference}
              onImportFavorites={handleImportFavorites}
              onExportFavorites={handleExportFavorites}
            />
          )}
        </main>

        <Statusbar
          message={statusMsg}
          count={statusCount}
          loading={statusLoading}
        />

        <ToastManager toasts={toasts} dismiss={dismiss} />

        <Drawer
          pkg={drawerPkg}
          favorite={drawerFavorite}
          isOpen={drawerOpen}
          onClose={handleCloseDrawer}
          onInstall={(id) => handleInstall([id])}
          onAddFavorite={handleAddFavorite}
          onRemoveFavorite={handleRemoveFavorite}
        />

        <Modal
          isOpen={modalOpen}
          state={installState}
          logs={logs}
          onCancel={cancelInstall}
          onClose={handleCloseModal}
        />
      </div>
    </ErrorBoundary>
  );
}
