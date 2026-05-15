import { useCallback, useEffect, useState } from "react";

const onboardingVersion = "v1";

export function getOnboardingStorageKey(accountId) {
  return accountId ? `lifequest-xp.onboarding.${onboardingVersion}.${accountId}` : null;
}

export function useOnboarding(accountId) {
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);

  useEffect(() => {
    const storageKey = getOnboardingStorageKey(accountId);

    if (!storageKey) {
      setIsOnboardingVisible(false);
      return;
    }

    try {
      setIsOnboardingVisible(window.localStorage.getItem(storageKey) !== "done");
    } catch {
      // If storage is blocked, keep the guide visible for this session.
      setIsOnboardingVisible(true);
    }
  }, [accountId]);

  const completeOnboarding = useCallback(() => {
    const storageKey = getOnboardingStorageKey(accountId);

    try {
      if (storageKey) {
        window.localStorage.setItem(storageKey, "done");
      }
    } catch {
      // The UI should still move forward even when localStorage is unavailable.
    }

    setIsOnboardingVisible(false);
  }, [accountId]);

  return { completeOnboarding, isOnboardingVisible };
}
