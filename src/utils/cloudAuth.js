import { supabase } from "./supabaseClient.js";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,email")
    .eq("id", sessionUser.id)
    .maybeSingle();

  return toCloudAccount(sessionUser, profile);
}

export async function registerCloudAccount({ displayName, email, passcode }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password: passcode,
    options: {
      data: {
        display_name: displayName.trim(),
      },
    },
  });

  if (error) throw new Error(error.message);
  if (!data.session) {
    throw new Error("Check your email to confirm this account, then log in.");
  }

  return fetchCloudAccount(data.user);
}

export async function loginCloudAccount({ email, passcode }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: passcode,
  });

  if (error) throw new Error(error.message);
  return fetchCloudAccount(data.user);
}

export async function logoutCloudAccount() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
