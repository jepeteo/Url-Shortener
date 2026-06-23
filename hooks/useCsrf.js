"use client";

import { useCallback, useEffect, useRef } from "react";

let cachedToken = null;
let tokenPromise = null;

async function fetchCsrfToken() {
  if (cachedToken) {
    return cachedToken;
  }

  if (!tokenPromise) {
    tokenPromise = fetch("/api/csrf")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch CSRF token");
        }
        return response.json();
      })
      .then((data) => {
        cachedToken = data.csrfToken;
        return cachedToken;
      })
      .finally(() => {
        tokenPromise = null;
      });
  }

  return tokenPromise;
}

export function useCsrf() {
  const tokenRef = useRef(null);

  useEffect(() => {
    fetchCsrfToken()
      .then((token) => {
        tokenRef.current = token;
      })
      .catch(() => {});
  }, []);

  const getToken = useCallback(async () => {
    const token = await fetchCsrfToken();
    tokenRef.current = token;
    return token;
  }, []);

  return { getToken };
}

export async function fetchWithCsrf(url, options = {}) {
  const csrfToken = await fetchCsrfToken();
  const headers = new Headers(options.headers);
  headers.set("X-CSRF-Token", csrfToken);

  return fetch(url, {
    ...options,
    headers,
  });
}

export function clearCsrfToken() {
  cachedToken = null;
}
