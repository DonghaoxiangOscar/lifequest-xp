export function getFriendlyAuthError(message, t) {
  const rawMessage = String(message || "");
  const normalizedMessage = rawMessage.toLowerCase();

  if (!rawMessage) return "";

  if (normalizedMessage.includes("email rate limit")) {
    return t("authErrors.emailRateLimit");
  }

  if (normalizedMessage.includes("invalid login credentials")) {
    return t("authErrors.invalidCredentials");
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return t("authErrors.emailNotConfirmed");
  }

  if (normalizedMessage.includes("already registered") || normalizedMessage.includes("user already")) {
    return t("authErrors.userAlreadyRegistered");
  }

  if (normalizedMessage.includes("password") && normalizedMessage.includes("characters")) {
    return t("authErrors.passwordTooShort");
  }

  if (normalizedMessage.includes("invalid path specified")) {
    return t("authErrors.invalidSupabaseUrl");
  }

  return rawMessage;
}
