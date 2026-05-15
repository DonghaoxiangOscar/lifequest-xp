import { KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { getFriendlyAuthError } from "../utils/authMessages.js";

export function PasswordResetGate({ onUpdatePassword }) {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.resetMismatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      await onUpdatePassword(password);
    } catch (caughtError) {
      setError(getFriendlyAuthError(caughtError.message, t));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="border-2 border-ink bg-ink p-6 text-paper shadow-hard sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center border-2 border-paper bg-bolt text-ink">
            <KeyRound size={28} />
          </div>
          <p className="mt-6 text-sm font-black uppercase text-bolt">{t("auth.resetEyebrow")}</p>
          <h1 className="mt-3 font-display text-5xl font-black uppercase leading-none sm:text-6xl">
            {t("auth.resetTitle")}
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold text-paper/80">{t("auth.resetIntro")}</p>
        </div>

        <form className="border-2 border-ink bg-paper p-5 shadow-hard sm:p-6" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 border-2 border-ink bg-white p-3">
            <ShieldCheck size={20} />
            <p className="text-sm font-black text-ink/70">{t("auth.resetSecureNote")}</p>
          </div>

          <div className="mt-5 space-y-3">
            <label className="grid gap-1 text-xs font-black uppercase text-ink/60">
              {t("auth.newPassword")}
              <input
                className="border-2 border-ink bg-white px-3 py-3 text-base font-bold text-ink outline-none focus:ring-4 focus:ring-ink/15"
                minLength="6"
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <label className="grid gap-1 text-xs font-black uppercase text-ink/60">
              {t("auth.confirmPassword")}
              <input
                className="border-2 border-ink bg-white px-3 py-3 text-base font-bold text-ink outline-none focus:ring-4 focus:ring-ink/15"
                minLength="6"
                required
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 border-2 border-ink bg-white px-3 py-2 text-sm font-bold text-ember">{error}</p>
          )}

          <button
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 border-2 border-ink bg-bolt px-4 py-3 font-black text-ink shadow-hard transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-ink/20 disabled:cursor-wait disabled:bg-ink/20"
            disabled={isSubmitting}
            type="submit"
          >
            <KeyRound size={18} />
            {isSubmitting ? t("auth.working") : t("auth.updatePassword")}
          </button>
        </form>
      </section>
    </main>
  );
}
