import { Cloud, HardDrive, LogOut, RefreshCw, Sparkles, Swords } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export function AppShell({
  children,
  pages,
  activePage,
  currentAccount,
  authMode = "local",
  syncError = "",
  syncStatus = "idle",
  onNavigate,
  onLogout,
  onLoadDemoData,
  onRetrySync,
}) {
  const { t } = useLanguage();
  const StorageIcon = authMode === "cloud" ? Cloud : HardDrive;

  return (
    <div className="min-h-screen text-ink">
      <header className="border-b-2 border-ink bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center border-2 border-ink bg-ember text-paper shadow-hard">
              <Swords size={25} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black uppercase leading-tight tracking-normal sm:text-3xl">
                LifeQuest XP
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="border-2 border-ink bg-bolt px-2 py-0.5 text-xs font-black uppercase">
                  {t("app.publicBeta")}
                </span>
                <p className="max-w-2xl text-sm font-semibold text-ink/70">{t("app.tagline")}</p>
              </div>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            {currentAccount && (
              <div className="flex min-h-11 flex-col justify-center border-2 border-ink bg-white px-3 py-2 text-sm font-black leading-tight">
                <span>{currentAccount.displayName}</span>
                <span className="mt-1 flex items-center gap-1 text-[11px] uppercase text-ink/55">
                  <StorageIcon size={13} />
                  {authMode === "cloud" ? t("sync.cloud") : t("sync.local")}
                  <RefreshCw size={12} className={syncStatus === "syncing" ? "animate-spin" : ""} />
                  {t(`sync.${syncStatus}`)}
                </span>
                {syncError && (
                  <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ember">
                    <span className="max-w-44 truncate">{syncError}</span>
                    {onRetrySync && (
                      <button
                        className="border border-ember bg-white px-1.5 py-0.5 font-black text-ember transition hover:bg-ember hover:text-paper focus:outline-none focus:ring-2 focus:ring-ember/20"
                        type="button"
                        onClick={onRetrySync}
                      >
                        {t("sync.retry")}
                      </button>
                    )}
                  </span>
                )}
              </div>
            )}

            {pages.map((page) => {
              const Icon = page.icon;
              const isActive = activePage === page.id;

              return (
                <button
                  key={page.id}
                  className={`flex min-h-11 items-center justify-center gap-2 border-2 border-ink px-3 py-2 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-ink/20 ${
                    isActive
                      ? "bg-ink text-paper shadow-hard"
                      : "bg-paper text-ink hover:-translate-y-0.5 hover:bg-bolt"
                  }`}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  title={t(page.labelKey)}
                  onClick={() => onNavigate(page.id)}
                >
                  <Icon size={17} />
                  <span>{t(page.labelKey)}</span>
                </button>
              );
            })}

            <button
              className="flex min-h-11 items-center justify-center gap-2 border-2 border-ink bg-paper px-3 py-2 text-sm font-black text-ink transition hover:-translate-y-0.5 hover:bg-bolt focus:outline-none focus:ring-4 focus:ring-ink/20"
              type="button"
              title={t("nav.loadDemoTitle")}
              onClick={onLoadDemoData}
            >
              <Sparkles size={17} />
              <span>{t("nav.demo")}</span>
            </button>

            <button
              className="flex min-h-11 items-center justify-center gap-2 border-2 border-ink bg-paper px-3 py-2 text-sm font-black text-ink transition hover:-translate-y-0.5 hover:bg-ink hover:text-paper focus:outline-none focus:ring-4 focus:ring-ink/20"
              type="button"
              title={t("nav.logoutTitle")}
              onClick={onLogout}
            >
              <LogOut size={17} />
              <span>{t("nav.logout")}</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
