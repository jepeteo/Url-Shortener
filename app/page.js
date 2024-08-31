"use client";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        throw new Error("Failed to shorten URL");
      }
      const data = await response.json();
      setShortUrl(data.shortUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">URL Shortener</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter your URL here"
          className="w-full px-4 py-2 rounded border border-gray-300 mb-4"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? "Shortening..." : "Shorten URL"}
        </button>
      </form>
      {error && (
        <p className="mt-4 text-red-500">{error}</p>
      )}
      {shortUrl && (
        <div className="mt-8">
          <p>Your shortened URL:</p>
          <a href={shortUrl} className="text-blue-500 hover:underline">
            {shortUrl}
          </a>
        </div>
      )}
    </main>
  );
}
