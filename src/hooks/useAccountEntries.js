import { useEffect, useState } from "react";

function getStorageKey(accountId) {
  return accountId ? `lifequest-xp.entries.${accountId}` : null;
}

export function useAccountEntries(accountId, initialEntries) {
  const [entries, setEntries] = useState([]);
  const [loadedKey, setLoadedKey] = useState(null);

  useEffect(() => {
    const storageKey = getStorageKey(accountId);

    if (!storageKey) {
      setEntries([]);
      setLoadedKey(null);
      return;
    }

    try {
      const storedEntries = window.localStorage.getItem(storageKey);
      setEntries(storedEntries ? JSON.parse(storedEntries) : initialEntries());
    } catch {
      setEntries(initialEntries());
    }

    setLoadedKey(storageKey);
  }, [accountId, initialEntries]);

  useEffect(() => {
    if (!loadedKey) return;
    window.localStorage.setItem(loadedKey, JSON.stringify(entries));
  }, [entries, loadedKey]);

  return [entries, setEntries];
}
