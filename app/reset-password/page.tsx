
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const router = useRouter();

  const generatePassword = () => {
    const letters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    const randomValues = new Uint32Array(12);
    crypto.getRandomValues(randomValues);

    const newPassword = Array.from(randomValues)
      .map((value) => letters[value % letters.length])
      .join("");

    setPassword(newPassword);
    setConfirmPassword(newPassword);
    setCopied(false);
    setError("");
    setMessage("");
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      setError("Unable to copy password. Please copy it manually.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Password updated successfully!");

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="bg-white w-full max-w-md rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-center text-orange-600">
          Stack Overflow
        </h1>

        <h2 className="text-2xl font-semibold text-center mt-8">
          Reset Password
        </h2>

        <p className="text-gray-500 text-center mt-2">
          Enter your new password below.
        </p>

        <form onSubmit={handleUpdatePassword} className="mt-8 space-y-5">
          <div>
            <label className="block font-medium mb-2">New Password</label>
            <input
              type="text"
              required
              minLength={8}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setCopied(false);
              }}
              placeholder="Enter new password"
              className="w-full border rounded-lg px-4 py-3"
            />

            <button
              type="button"
              onClick={generatePassword}
              className="mt-2 text-blue-600 font-medium hover:underline"
            >
              Generate Password
            </button>

            {password && (
              <button
                type="button"
                onClick={copyPassword}
                className="ml-4 text-green-600 font-medium hover:underline"
              >
                {copied ? "Copied!" : "Copy Password"}
              </button>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Generated password contains only English letters.
            </p>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
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
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
