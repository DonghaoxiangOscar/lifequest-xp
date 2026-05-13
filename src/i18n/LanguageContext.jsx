import { createContext, useContext, useEffect, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import {
  detectBrowserLanguage,
  languageStorageKey,
  supportedLanguages,
  translate,
} from "./translations.js";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useLocalStorage(languageStorageKey, detectBrowserLanguage);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      supportedLanguages,
      t: (key, params) => translate(language, key, params),
    }),
    [language, setLanguage],
  );

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider.");
  }

  return context;
}
