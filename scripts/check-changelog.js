#!/usr/bin/env node

const { execSync } = require("child_process");

const CHANGELOG = "CHANGELOG.md";
const WATCHED_PREFIXES = ["app/", "lib/", "components/", "scripts/"];
const WATCHED_FILES = ["middleware.js"];
const EXEMPT_PREFIXES = ["__tests__/", ".github/", "graphify-out/"];
const EXEMPT_FILES = new Set([
  "scripts/check-changelog.js",
  "eslint.config.mjs",
  "jsconfig.json",
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
]);

function isWatched(file) {
  if (EXEMPT_FILES.has(file)) {
    return false;
  }
  if (EXEMPT_PREFIXES.some((prefix) => file.startsWith(prefix))) {
    return false;
  }
  if (WATCHED_PREFIXES.some((prefix) => file.startsWith(prefix))) {
    return true;
  }
  if (WATCHED_FILES.includes(file)) {
    return true;
  }
  if (file.endsWith(".config.js") || file.endsWith(".config.mjs")) {
    return false;
  }
  return false;
}

function getChangedFiles(baseRef) {
  try {
    execSync(`git fetch origin ${baseRef} --depth=1`, { stdio: "ignore" });
  } catch {
    // Local runs may not have remote; fall back to merge-base with local branch.
  }

  const refs = [`origin/${baseRef}...HEAD`, `${baseRef}...HEAD`, "HEAD~1...HEAD"];

  for (const ref of refs) {
    try {
      const output = execSync(`git diff --name-only ${ref}`, {
        encoding: "utf8",
      }).trim();
      if (output) {
        return output.split("\n").filter(Boolean);
      }
    } catch {
      // Try next ref.
    }
  }

  return [];
}

function main() {
  const baseRef = process.env.CHANGELOG_BASE_REF || "main";
  const changedFiles = getChangedFiles(baseRef);
  const watchedChanges = changedFiles.filter(isWatched);
  const changelogUpdated = changedFiles.includes(CHANGELOG);

  if (watchedChanges.length === 0) {
    console.log("No application source changes detected; changelog check skipped.");
    return;
  }

  if (!changelogUpdated) {
    console.error(
      "Application code changed but CHANGELOG.md was not updated. Add an entry under [Unreleased]."
    );
    console.error("Changed application files:");
    for (const file of watchedChanges) {
      console.error(`  - ${file}`);
    }
    process.exit(1);
  }

  console.log("CHANGELOG.md updated for application source changes.");
}

main();
