import { useCallback, useEffect, useMemo, useState } from "react";
import { activitiesToRows, entryToRow, rowToEntry } from "../utils/cloudEntries.js";
import { withTimeout } from "../utils/asyncTimeout.js";
import { supabase } from "../utils/supabaseClient.js";

function getStorageKey(accountId) {
  return accountId ? `lifequest-xp.entries.${accountId}` : null;
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function useEntries(account, initialEntries) {
  const isCloud = account?.storageMode === "cloud";
  const accountId = account?.id;
  const [entries, setEntries] = useState([]);
  const [loadedKey, setLoadedKey] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [syncError, setSyncError] = useState("");

  const storageLabel = isCloud ? "cloud" : "local";

  const loadEntries = useCallback(
    async ({ keepLoaded = false, isActive = () => true } = {}) => {
      const storageKey = getStorageKey(accountId);

      if (!keepLoaded) {
        setIsLoaded(false);
      }

      setSyncError("");

      if (!accountId) {
        if (!isActive()) return;
        setEntries([]);
        setLoadedKey(null);
        setIsLoaded(true);
        return;
      }

      if (isCloud) {
        setSyncStatus("syncing");

        try {
          const { data, error } = await withTimeout(
            supabase
              .from("activity_entries")
              .select("*")
              .eq("user_id", accountId)
              .order("created_at", { ascending: false }),
            "Activity sync took too long. Please refresh or try again later.",
          );

          if (!isActive()) return;

          if (error) {
            if (!keepLoaded) {
              setEntries([]);
            }
            setSyncStatus("error");
            setSyncError(error.message);
          } else {
            setEntries((data ?? []).map(rowToEntry));
            setSyncStatus("synced");
          }
        } catch (error) {
          if (!isActive()) return;
          if (!keepLoaded) {
            setEntries([]);
          }
          setSyncStatus("error");
          setSyncError(error.message);
        }

        if (!isActive()) return;
        setLoadedKey(null);
        setIsLoaded(true);
        return;
      }

      let nextEntries;

      try {
        const storedEntries = window.localStorage.getItem(storageKey);
        nextEntries = storedEntries ? JSON.parse(storedEntries) : initialEntries();
      } catch {
        nextEntries = initialEntries();
      }

      if (!isActive()) return;
      setEntries(nextEntries);
      setLoadedKey(storageKey);
      setSyncStatus("local");
      setIsLoaded(true);
    },
    [accountId, initialEntries, isCloud],
  );

  const refreshEntries = useCallback(() => loadEntries({ keepLoaded: true }), [loadEntries]);

  useEffect(() => {
    let isMounted = true;

    loadEntries({ isActive: () => isMounted });

    return () => {
      isMounted = false;
    };
  }, [loadEntries]);

  useEffect(() => {
    if (!loadedKey || !isLoaded || isCloud) return;
    window.localStorage.setItem(loadedKey, JSON.stringify(entries));
  }, [entries, isCloud, isLoaded, loadedKey]);

  const saveCloudEntry = useCallback(
    async (entry) => {
      if (!isCloud || !accountId) return;

      setSyncStatus("syncing");
      setSyncError("");

      const { error } = await supabase.from("activity_entries").upsert(entryToRow(entry, accountId));
      if (error) throw error;

      await supabase.from("parsed_activities").delete().eq("entry_id", entry.id);
      const activityRows = activitiesToRows(entry, accountId);
      if (activityRows.length > 0) {
        const { error: activityError } = await supabase.from("parsed_activities").insert(activityRows);
        if (activityError) throw activityError;
      }

      setSyncStatus("synced");
      setSyncError("");
    },
    [accountId, isCloud],
  );

  const addEntry = useCallback(
    async (entry) => {
      setEntries((currentEntries) => sortEntries([entry, ...currentEntries]));

      if (!isCloud) return;

      try {
        await saveCloudEntry(entry);
      } catch (error) {
        setSyncStatus("error");
        setSyncError(error.message);
      }
    },
    [isCloud, saveCloudEntry],
  );

  const updateEntry = useCallback(
    async (entryId, buildEntry) => {
      const currentEntry = entries.find((entry) => entry.id === entryId);
      if (!currentEntry) return;

      const nextEntry = buildEntry(currentEntry);
      setEntries((currentEntries) =>
        sortEntries(currentEntries.map((entry) => (entry.id === entryId ? nextEntry : entry))),
      );

      if (!isCloud) return;

      try {
        await saveCloudEntry(nextEntry);
      } catch (error) {
        setSyncStatus("error");
        setSyncError(error.message);
      }
    },
    [entries, isCloud, saveCloudEntry],
  );

  const deleteEntry = useCallback(
    async (entryId) => {
      setEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== entryId));

      if (!isCloud) return;

      try {
        setSyncStatus("syncing");
        setSyncError("");
        const { error } = await supabase.from("activity_entries").delete().eq("id", entryId);
        if (error) throw error;
        setSyncStatus("synced");
        setSyncError("");
      } catch (error) {
        setSyncStatus("error");
        setSyncError(error.message);
      }
    },
    [isCloud],
  );

  const replaceEntries = useCallback(
    async (nextEntries) => {
      const sortedEntries = sortEntries(nextEntries);
      setEntries(sortedEntries);

      if (!isCloud || !accountId) return;

      try {
        setSyncStatus("syncing");
        setSyncError("");
        const { error: summaryDeleteError } = await supabase.from("daily_summaries").delete().eq("user_id", accountId);
        if (summaryDeleteError) throw summaryDeleteError;

        const { error: deleteError } = await supabase.from("activity_entries").delete().eq("user_id", accountId);
        if (deleteError) throw deleteError;

        if (sortedEntries.length > 0) {
          const { error: insertError } = await supabase
            .from("activity_entries")
            .insert(sortedEntries.map((entry) => entryToRow(entry, accountId)));
          if (insertError) throw insertError;

          const activityRows = sortedEntries.flatMap((entry) => activitiesToRows(entry, accountId));
          if (activityRows.length > 0) {
            const { error: activityError } = await supabase.from("parsed_activities").insert(activityRows);
            if (activityError) throw activityError;
          }
        }

        setSyncStatus("synced");
        setSyncError("");
      } catch (error) {
        setSyncStatus("error");
        setSyncError(error.message);
      }
    },
    [accountId, isCloud],
  );

  const clearEntries = useCallback(async () => {
    await replaceEntries([]);
  }, [replaceEntries]);

  return useMemo(
    () => ({
      entries,
      isLoaded,
      syncError,
      syncStatus,
      storageLabel,
      addEntry,
      updateEntry,
      deleteEntry,
      replaceEntries,
      clearEntries,
      refreshEntries,
    }),
    [
      addEntry,
      clearEntries,
      deleteEntry,
      entries,
      isLoaded,
      replaceEntries,
      refreshEntries,
      storageLabel,
      syncError,
      syncStatus,
      updateEntry,
    ],
  );
}
