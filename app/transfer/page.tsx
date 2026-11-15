
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Transfer = {
  id: number;
  sender_id: string;
  receiver_id: string;
  amount: number;
  created_at: string;
};

export default function TransferPage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<Transfer[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) return;

    const id = authData.user.id;
    setUserId(id);

    const { data: pointData } = await supabase
      .from("user_points")
      .select("points")
      .eq("user_id", id)
      .maybeSingle();

    setPoints(pointData?.points ?? 0);

    const { data: transfers } = await supabase
      .from("point_transfers")
      .select("*")
      .order("created_at", { ascending: false });

    setHistory(transfers ?? []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const numericAmount = Number(amount);

    if (!email.trim()) {
      setError("Enter recipient email.");
      return;
    }

    if (!Number.isInteger(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid whole number of points.");
      return;
    }

    if (numericAmount > points) {
      setError("You do not have enough points.");
      return;
    }

    setLoading(true);

    const { error: transferError } = await supabase.rpc(
      "transfer_points_by_email",
      {
        p_recipient_email: email.trim(),
        p_amount: numericAmount,
      }
    );

    setLoading(false);

    if (transferError) {
      setError(transferError.message);
      return;
    }

    setMessage("Points transferred successfully!");
    setEmail("");
    setAmount("");

    await loadData();
  };

  if (!userId) {
    return <p className="p-8">Please log in to transfer points.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold text-orange-600">
          Transfer Points
        </h1>

        <p className="mt-4 text-lg font-semibold">
          Your balance: {points} points
        </p>

        <form onSubmit={handleTransfer} className="mt-6 space-y-4">
          <div>
            <label className="block font-medium mb-2">
              Recipient Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter registered email"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Points to Transfer
            </label>
            <input
              type="number"
              min="1"
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter points"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          {message && (
            <p className="text-green-600 text-sm">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Transferring..." : "Transfer Points"}
          </button>
        </form>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          Transfer History
        </h2>

        {history.length === 0 ? (
          <p className="text-gray-500">No transfers yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-3"
              >
                <p className="font-medium">
                  {item.sender_id === userId
                    ? `Sent ${item.amount} points`
                    : `Received ${item.amount} points`}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
