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
import { isSupabaseConfigured, supabase } from "../utils/supabaseClient.js";

export function useAuth() {
  const [currentAccount, setCurrentAccount] = useState(() =>
    isSupabaseConfigured ? null : getCurrentAccount(),
  );
  const [isAuthReady, setIsAuthReady] = useState(!isSupabaseConfigured);
  const authMode = isSupabaseConfigured ? "cloud" : "local";

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let isMounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      const account = data.session?.user ? await fetchCloudAccount(data.session.user) : null;

      if (isMounted) {
        setCurrentAccount(account);
        setIsAuthReady(true);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const account = session?.user ? await fetchCloudAccount(session.user) : null;
      if (isMounted) setCurrentAccount(account);
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
    setCurrentAccount(account);
    return account;
  }

  async function login(credentials) {
    const account = isSupabaseConfigured
      ? await loginCloudAccount(credentials)
      : await loginLocalAccount(credentials);
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
    currentAccount,
    isAuthReady,
    register,
    login,
    logout,
  };
}
