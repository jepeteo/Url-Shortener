"use client";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // implement the API call here later
    console.log("Submitting:", url);
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
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Shorten URL
        </button>
      </form>
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
