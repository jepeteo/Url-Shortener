/**
 * Decide whether a GitHub sign-in may use an existing local account.
 * Unverified password accounts are never adopted, which blocks pre-account takeover.
 * Verified accounts can still be linked so a person who proved the email can use GitHub.
 *
 * providerEmailVerified: true, false, or null when GitHub did not say.
 */
export function resolveGithubAccountLink({
  existingUser,
  providerAccountId,
  providerEmailVerified = null,
}) {
  const githubId =
    providerAccountId == null || providerAccountId === ""
      ? null
      : String(providerAccountId);

  if (providerEmailVerified === false) {
    return { action: "reject", reason: "provider-email-unverified" };
  }

  if (!existingUser) {
    return { action: "create" };
  }

  if (existingUser.githubId && githubId && existingUser.githubId === githubId) {
    return { action: "link" };
  }

  if (existingUser.githubId && githubId && existingUser.githubId !== githubId) {
    return { action: "reject", reason: "github-mismatch" };
  }

  if (!existingUser.emailVerified) {
    return { action: "reject", reason: "unverified-email" };
  }

  return { action: "link" };
}

/**
 * GitHub only publishes a profile email after it is verified, and primary
 * emails from /user/emails include a verified flag when we have fetched them.
 * Returns null when the profile does not say either way.
 */
export function githubEmailIsVerified(profile, email) {
  if (!profile || !email) {
    return null;
  }

  const normalized = email.toLowerCase();
  if (Array.isArray(profile.emails)) {
    const match = profile.emails.find(
      (entry) => entry?.email?.toLowerCase() === normalized
    );
    if (match && typeof match.verified === "boolean") {
      return match.verified;
    }
  }

  if (typeof profile.email_verified === "boolean") {
    return profile.email_verified;
  }

  if (profile.email && profile.email.toLowerCase() === normalized) {
    return true;
  }

  return null;
}
