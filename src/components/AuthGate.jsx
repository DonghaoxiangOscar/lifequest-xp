import { LockKeyhole, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export function AuthGate({ onLogin, onRegister }) {
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const [mode, setMode] = useState("register");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegistering = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await onRegister({ displayName, email, passcode });
      } else {
        await onLogin({ email, passcode });
      }
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="border-2 border-ink bg-ink p-6 text-paper shadow-hard sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center border-2 border-paper bg-bolt text-ink">
            <LockKeyhole size={28} />
          </div>
          <p className="mt-6 text-sm font-black uppercase text-bolt">{t("auth.eyebrow")}</p>
          <h1 className="mt-3 font-display text-5xl font-black uppercase leading-none sm:text-6xl">
            {t("auth.title")}
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold text-paper/80">{t("auth.intro")}</p>
        </div>

        <form className="border-2 border-ink bg-paper p-5 shadow-hard sm:p-6" onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-2 border-ink bg-white p-2">
            <span className="px-1 text-xs font-black uppercase text-ink/60">{t("settings.displayLanguage")}</span>
            <div className="flex gap-2">
              {supportedLanguages.map((option) => (
                <button
                  key={option.id}
                  className={`border-2 border-ink px-3 py-1 text-sm font-black ${
                    option.id === language ? "bg-bolt" : "bg-paper"
                  }`}
                  type="button"
                  aria-pressed={option.id === language}
                  onClick={() => setLanguage(option.id)}
                >
                  {option.nativeLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              className={`flex min-h-11 items-center justify-center gap-2 border-2 border-ink px-3 py-2 font-black ${
                isRegistering ? "bg-ink text-paper" : "bg-white"
              }`}
              type="button"
              onClick={() => setMode("register")}
            >
              <UserPlus size={17} />
              {t("auth.register")}
            </button>
            <button
              className={`flex min-h-11 items-center justify-center gap-2 border-2 border-ink px-3 py-2 font-black ${
                !isRegistering ? "bg-ink text-paper" : "bg-white"
              }`}
              type="button"
              onClick={() => setMode("login")}
            >
              <LogIn size={17} />
              {t("auth.login")}
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {isRegistering && (
              <label className="grid gap-1 text-xs font-black uppercase text-ink/60">
                {t("auth.displayName")}
                <input
                  className="border-2 border-ink bg-white px-3 py-3 text-base font-bold text-ink outline-none focus:ring-4 focus:ring-ink/15"
                  required
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </label>
            )}

            <label className="grid gap-1 text-xs font-black uppercase text-ink/60">
              {t("auth.email")}
              <input
                className="border-2 border-ink bg-white px-3 py-3 text-base font-bold text-ink outline-none focus:ring-4 focus:ring-ink/15"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="grid gap-1 text-xs font-black uppercase text-ink/60">
              {t("auth.passcode")}
              <input
                className="border-2 border-ink bg-white px-3 py-3 text-base font-bold text-ink outline-none focus:ring-4 focus:ring-ink/15"
                minLength="6"
                required
                type="password"
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
              />
            </label>
          </div>

          {error && <p className="mt-4 border-2 border-ink bg-white px-3 py-2 text-sm font-bold text-ember">{error}</p>}

          <div className="mt-5 border-2 border-ink bg-white p-3 text-sm font-bold text-ink/70">
            {t("auth.localWarning")}
          </div>

          <button
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 border-2 border-ink bg-bolt px-4 py-3 font-black text-ink shadow-hard transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-ink/20 disabled:cursor-wait disabled:bg-ink/20"
            disabled={isSubmitting}
            type="submit"
          >
            {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
            {isSubmitting ? t("auth.working") : isRegistering ? t("auth.createAccount") : t("auth.login")}
          </button>
        </form>
      </section>
    </main>
  );
}
