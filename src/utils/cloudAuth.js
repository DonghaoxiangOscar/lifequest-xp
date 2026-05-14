import { supabase } from "./supabaseClient.js";
import { withTimeout } from "./asyncTimeout.js";

const viteEnv = import.meta.env ?? {};
const appBasePath = viteEnv.BASE_URL ?? "/";

export function buildAuthRedirectUrl(origin, basePath = appBasePath) {
  const normalizedBasePath = basePath.endsWith("/") ? basePath : `${basePath}/`;
  return new URL(normalizedBasePath, origin).toString();
}

function getAuthRedirectUrl() {
  if (typeof window === "undefined") return undefined;
  return buildAuthRedirectUrl(window.location.origin);
}

function toCloudAccount(user, profile = null) {
  if (!user) return null;

  return {
    id: user.id,
    displayName: profile?.display_name ?? user.user_metadata?.display_name ?? user.email ?? "Player",
    email: user.email,
    storageMode: "cloud",
  };
}

export async function fetchCloudAccount(sessionUser) {
  if (!supabase || !sessionUser) return null;

  const { data: profile, error } = await withTimeout(
    supabase.from("profiles").select("display_name,email").eq("id", sessionUser.id).maybeSingle(),
    "Profile loading took too long. Please refresh or try logging in again.",
  );

  if (error) {
    // The account can still work from Supabase Auth metadata even if the profile row is delayed.
    console.warn("Could not load Supabase profile", error);
  }

  return toCloudAccount(sessionUser, profile);
}

export async function registerCloudAccount({ displayName, email, passcode }) {
  const { data, error } = await withTimeout(
    supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: passcode,
      options: {
        // Force email confirmation links back to the current app base path.
        // This prevents GitHub Pages redirects from losing the /lifequest-xp/ prefix.
        emailRedirectTo: getAuthRedirectUrl(),
        data: {
          display_name: displayName.trim(),
        },
      },
    }),
    "Registration took too long. Please check your connection and try again.",
  );

  if (error) throw new Error(error.message);
  if (!data.session) {
    throw new Error("Check your email to confirm this account, then log in.");
  }

  return fetchCloudAccount(data.user);
}

export async function loginCloudAccount({ email, passcode }) {
  const { data, error } = await withTimeout(
    supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: passcode,
    }),
    "Login took too long. Please check your connection and try again.",
  );

  if (error) throw new Error(error.message);
  return fetchCloudAccount(data.user);
}

export async function logoutCloudAccount() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
