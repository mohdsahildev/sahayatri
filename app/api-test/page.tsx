"use client";

import { FormEvent, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AuthTestPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      setResult({
        status: response.status,
        data,
      });
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <h1 className="text-2xl font-bold">Auth Test</h1>

      <form
        onSubmit={handleLogin}
        className="mt-6 flex max-w-md flex-col gap-4"
      >
        <input
          type="email"
          placeholder="Test email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded border border-white/20 bg-white p-3 text-black"
          required
        />

        <input
          type="password"
          placeholder="Test password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded border border-white/20 bg-white p-3 text-black"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-white px-4 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {result && (
         <pre className="mt-8 overflow-auto rounded-lg bg-white p-4 text-black">
           {JSON.stringify(result, null, 2)}
         </pre>
       )}
    </main>
  );
}