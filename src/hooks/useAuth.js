import { useEffect, useState } from "react";
import {
  clearCurrentAccount,
  getCurrentAccount,
  loginLocalAccount,
  registerLocalAccount,
} from "../utils/auth.js";
import {
  fetchCloudAccount,
  loginCloudAccount,
  logoutCloudAccount,
  registerCloudAccount,
} from "../utils/cloudAuth.js";
import { withTimeout } from "../utils/asyncTimeout.js";
import { isSupabaseConfigured, supabase } from "../utils/supabaseClient.js";

export function useAuth() {
  const [currentAccount, setCurrentAccount] = useState(() =>
    isSupabaseConfigured ? null : getCurrentAccount(),
  );
  const [authError, setAuthError] = useState("");
  const [isAuthReady, setIsAuthReady] = useState(!isSupabaseConfigured);
  const authMode = isSupabaseConfigured ? "cloud" : "local";

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let isMounted = true;

    async function loadSession() {
      try {
        const { data, error } = await withTimeout(
          supabase.auth.getSession(),
          "Session loading took too long. Please refresh or log in again.",
        );
        if (error) throw error;

        const account = data.session?.user ? await fetchCloudAccount(data.session.user) : null;

        if (isMounted) {
          setAuthError("");
          setCurrentAccount(account);
          setIsAuthReady(true);
        }
      } catch (error) {
        if (isMounted) {
          setAuthError(error.message);
          setCurrentAccount(null);
          setIsAuthReady(true);
        }
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(async () => {
        try {
          const account = session?.user ? await fetchCloudAccount(session.user) : null;
          if (isMounted) {
            setAuthError("");
            setCurrentAccount(account);
          }
        } catch (error) {
          if (isMounted) setAuthError(error.message);
        }
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function register(credentials) {
    const account = isSupabaseConfigured
      ? await registerCloudAccount(credentials)
      : await registerLocalAccount(credentials);
    setAuthError("");
    setCurrentAccount(account);
    return account;
  }

  async function login(credentials) {
    const account = isSupabaseConfigured
      ? await loginCloudAccount(credentials)
      : await loginLocalAccount(credentials);
    setAuthError("");
    setCurrentAccount(account);
    return account;
  }

  async function logout() {
    if (isSupabaseConfigured) {
      await logoutCloudAccount();
    } else {
      clearCurrentAccount();
    }

    setCurrentAccount(null);
  }

  return {
    authMode,
    authError,
    currentAccount,
    isAuthReady,
    register,
    login,
    logout,
  };
}
