import { describe, expect, it } from "vitest";
import { githubEmailIsVerified, resolveGithubAccountLink } from "../lib/accountLinking";

describe("resolveGithubAccountLink", () => {
  it("creates an account when the email is new", () => {
    expect(
      resolveGithubAccountLink({
        existingUser: null,
        providerAccountId: "100",
        providerEmailVerified: true,
      })
    ).toEqual({ action: "create" });
  });

  it("links a verified password account", () => {
    expect(
      resolveGithubAccountLink({
        existingUser: { id: "u1", emailVerified: new Date(), githubId: null },
        providerAccountId: "100",
        providerEmailVerified: true,
      })
    ).toEqual({ action: "link" });
  });

  it("links a verified account when GitHub does not send an explicit flag", () => {
    expect(
      resolveGithubAccountLink({
        existingUser: { id: "u1", emailVerified: new Date(), githubId: null },
        providerAccountId: "100",
        providerEmailVerified: null,
      })
    ).toEqual({ action: "link" });
  });

  it("rejects an unverified password account", () => {
    expect(
      resolveGithubAccountLink({
        existingUser: { id: "u1", emailVerified: null, githubId: null, password: "hash" },
        providerAccountId: "100",
        providerEmailVerified: true,
      })
    ).toEqual({ action: "reject", reason: "unverified-email" });
  });

  it("rejects a provider email GitHub says is unverified", () => {
    expect(
      resolveGithubAccountLink({
        existingUser: { id: "u1", emailVerified: new Date(), githubId: null },
        providerAccountId: "100",
        providerEmailVerified: false,
      })
    ).toEqual({ action: "reject", reason: "provider-email-unverified" });
  });

  it("rejects a different GitHub account on the same email", () => {
    expect(
      resolveGithubAccountLink({
        existingUser: { id: "u1", emailVerified: new Date(), githubId: "200" },
        providerAccountId: "100",
        providerEmailVerified: true,
      })
    ).toEqual({ action: "reject", reason: "github-mismatch" });
  });

  it("links the same GitHub account on return", () => {
    expect(
      resolveGithubAccountLink({
        existingUser: { id: "u1", emailVerified: new Date(), githubId: "100" },
        providerAccountId: "100",
        providerEmailVerified: true,
      })
    ).toEqual({ action: "link" });
  });
});

describe("githubEmailIsVerified", () => {
  it("trusts a public GitHub profile email", () => {
    expect(githubEmailIsVerified({ email: "a@example.com" }, "a@example.com")).toBe(true);
  });

  it("uses the emails endpoint flag when present", () => {
    expect(
      githubEmailIsVerified(
        { emails: [{ email: "a@example.com", verified: false, primary: true }] },
        "a@example.com"
      )
    ).toBe(false);
  });

  it("returns null when the profile does not speak to the email", () => {
    expect(githubEmailIsVerified({}, "a@example.com")).toBeNull();
  });
});
