const accountsKey = "lifequest-xp.localAccounts";
const sessionKey = "lifequest-xp.currentAccountId";

function readJson(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function createSalt() {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPasscode(passcode, salt) {
  if (!window.crypto?.subtle) {
    throw new Error("This browser does not support local passcode hashing.");
  }

  const input = new TextEncoder().encode(`${salt}:${passcode}`);
  const buffer = await window.crypto.subtle.digest("SHA-256", input);
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function getLocalAccounts() {
  return readJson(accountsKey, []);
}

export function getCurrentAccountId() {
  return window.localStorage.getItem(sessionKey);
}

export function getCurrentAccount() {
  const accountId = getCurrentAccountId();
  return getLocalAccounts().find((account) => account.id === accountId) ?? null;
}

export function clearCurrentAccount() {
  window.localStorage.removeItem(sessionKey);
}

export async function registerLocalAccount({ displayName, email, passcode }) {
  const accounts = getLocalAccounts();
  const normalizedEmail = email.trim().toLowerCase();

  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error("An account with this email already exists on this browser.");
  }

  const salt = createSalt();
  const passcodeHash = await hashPasscode(passcode, salt);
  const account = {
    id: window.crypto.randomUUID(),
    displayName: displayName.trim(),
    email: normalizedEmail,
    salt,
    passcodeHash,
    createdAt: new Date().toISOString(),
  };

  writeJson(accountsKey, [...accounts, account]);
  window.localStorage.setItem(sessionKey, account.id);

  return account;
}

export async function loginLocalAccount({ email, passcode }) {
  const accounts = getLocalAccounts();
  const normalizedEmail = email.trim().toLowerCase();
  const account = accounts.find((candidate) => candidate.email === normalizedEmail);

  if (!account) {
    throw new Error("No local account found for this email.");
  }

  const passcodeHash = await hashPasscode(passcode, account.salt);
  if (passcodeHash !== account.passcodeHash) {
    throw new Error("Incorrect passcode.");
  }

  window.localStorage.setItem(sessionKey, account.id);
  return account;
}
