import { useState } from "react";
import {
  clearCurrentAccount,
  getCurrentAccount,
  loginLocalAccount,
  registerLocalAccount,
} from "../utils/auth.js";

export function useLocalAuth() {
  const [currentAccount, setCurrentAccount] = useState(() => getCurrentAccount());

  async function register(credentials) {
    const account = await registerLocalAccount(credentials);
    setCurrentAccount(account);
    return account;
  }

  async function login(credentials) {
    const account = await loginLocalAccount(credentials);
    setCurrentAccount(account);
    return account;
  }

  function logout() {
    clearCurrentAccount();
    setCurrentAccount(null);
  }

  return {
    currentAccount,
    register,
    login,
    logout,
  };
}
