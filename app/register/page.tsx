
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
       email,
       password,
       options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
       },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push("/questions");
    } else {
      setMessage("Registration successful! Please verify your email before logging in.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="bg-white w-full max-w-md rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-center text-orange-600">
          Stack Overflow
        </h1>

        <h2 className="text-2xl font-semibold text-center mt-6">
          Create your account
        </h2>

        <form onSubmit={handleRegister} className="mt-7 space-y-4">
          <div>
            <label className="block font-medium mb-2">Full Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold">
            Log in
          </Link>
        </p>

        <div className="text-center mt-5">
          <Link href="/" className="text-gray-500">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
