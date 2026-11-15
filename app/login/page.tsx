
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        router.replace("/questions");
      } else {
        setCheckingAuth(false);
      }
    };

    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/questions");
  };

  if (checkingAuth) {
    return (
      <p className="text-center mt-20">
        Checking login status...
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="bg-white w-full max-w-md rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-center text-orange-600">
          Stack Overflow
        </h1>

        <h2 className="text-2xl font-semibold text-center mt-8">
          Log in
        </h2>

        <p className="text-gray-500 text-center mt-2">
          Welcome back! Please enter your details.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="block font-medium mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <div className="text-right">
            <Link href="/forgot-password" className="text-blue-600 text-sm">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 font-semibold">
            Sign up
          </Link>
        </p>

        <div className="text-center mt-5">
          <Link href="/" className="text-gray-500 hover:text-blue-600">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
