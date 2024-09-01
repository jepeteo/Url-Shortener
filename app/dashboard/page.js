"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchUrls();
    }
  }, [status]);

  const fetchUrls = async () => {
    const response = await fetch("/api/urls");
    if (response.ok) {
      const data = await response.json();
      setUrls(data);
    }
  };

  const handleRemove = async (id) => {
    const response = await fetch("/api/urls/$id", { method: "DELETE" });
    if (response.ok) {
      setUrls(urls.filter((url) => url._id !== id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Shortened URLs</h1>
      <Link
        href="/"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Back to Home
      </Link>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Original URL</th>
            <th className="border p-2">Short URL</th>
            <th className="border p-2">Clicks</th>
            <th className="border p-2">Created At</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((url) => (
            <tr key={url._id}>
              <td className="border p-2">{url.originalUrl}</td>
              <td className="border p-2">
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_URL}/${url.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {`${process.env.NEXT_PUBLIC_BASE_URL}/${url.shortCode}`}
                </a>
              </td>
              <td className="border p-2">{url.visits}</td>
              <td className="border p-2">
                {new Date(url.createdAt).toLocaleString()}
              </td>
              <td className="border p-2">
                <button
                  onClick={() => handleRemove(url._id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
