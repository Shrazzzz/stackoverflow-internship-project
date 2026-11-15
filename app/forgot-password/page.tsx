
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    setLoading(true);

    const { data: allowed, error: limitError } = await supabase.rpc(
      "allow_password_reset_request",
      { p_email: normalizedEmail }
    );

    if (limitError) {
      setLoading(false);
      setError("Unable to process your request. Please try again later.");
      return;
    }

    if (allowed !== true) {
      setLoading(false);
      setError(
        "You have already requested a password reset today. Please try again tomorrow."
      );
      return;
    }

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage(
      "Password reset link sent! Please check your email. You can request another link tomorrow."
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="bg-white w-full max-w-md rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-center text-orange-600">
          Stack Overflow
        </h1>

        <h2 className="text-2xl font-semibold text-center mt-8">
          Forgot Password?
        </h2>

        <p className="text-gray-500 text-center mt-2">
          Enter your registered email to receive a password reset link.
        </p>

        <form onSubmit={handleReset} className="mt-8 space-y-5">
          <div>
            <label className="block font-medium mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
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
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/login" className="text-blue-600 hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
