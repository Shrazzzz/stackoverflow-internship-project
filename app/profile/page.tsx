
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [points, setPoints] = useState(0);
  const [questions, setQuestions] = useState(0);
  const [answers, setAnswers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [loginTime, setLoginTime] = useState("");
  const [browserInfo, setBrowserInfo] = useState("");
  const [deviceInfo, setDeviceInfo] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          router.replace("/login");
          return;
        }

        const user = authData.user;

        setName(user.user_metadata?.full_name || "User");
        setEmail(user.email || "");

        const [pointsResult, questionsResult, answersResult] =
          await Promise.all([
            supabase
              .from("user_points")
              .select("points")
              .eq("user_id", user.id)
              .maybeSingle(),

            supabase
              .from("questions")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id),

            supabase
              .from("answers")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id),
          ]);

        setPoints(pointsResult.data?.points ?? 0);
        setQuestions(questionsResult.count ?? 0);
        setAnswers(answersResult.count ?? 0);

        setLoginTime(
          new Date().toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Kolkata",
          })
        );

        const ua = navigator.userAgent;

        let browser = "Unknown browser";

        if (ua.includes("Edg/")) {
          browser = "Microsoft Edge";
        } else if (ua.includes("Chrome/")) {
          browser = "Google Chrome";
        } else if (ua.includes("Firefox/")) {
          browser = "Mozilla Firefox";
        } else if (ua.includes("Safari/")) {
          browser = "Safari";
        }

        setBrowserInfo(browser);

        setDeviceInfo(
          /Mobi|Android|iPhone|iPad/i.test(ua)
            ? "Mobile"
            : "Desktop / Other"
        );
      } catch (error) {
        console.error("Profile loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
  };

  if (loading) {
    return <p className="text-center mt-20">Loading profile...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-orange-600 text-center">
          My Profile
        </h1>

        <div className="text-center mt-6">
          <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold mx-auto">
            {name.charAt(0).toUpperCase()}
          </div>

          <h2 className="text-2xl font-semibold mt-4">{name}</h2>
          <p className="text-gray-500">{email}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-orange-50 rounded-lg p-5 text-center">
            <h3 className="text-gray-600">Total Points</h3>
            <p className="text-3xl font-bold text-orange-600">{points}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-5 text-center">
            <h3 className="text-gray-600">Questions Posted</h3>
            <p className="text-3xl font-bold text-blue-600">{questions}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-5 text-center">
            <h3 className="text-gray-600">Answers Posted</h3>
            <p className="text-3xl font-bold text-green-600">{answers}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-5 text-center">
            <h3 className="text-gray-600">Account Status</h3>
            <p className="text-xl font-bold text-purple-600">Active</p>
          </div>
        </div>

        <div className="mt-8 border rounded-lg p-5">
          <h2 className="text-xl font-bold text-gray-800">
            Login History
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Current session information
          </p>

          <div className="mt-4 space-y-2 text-gray-700">
            <p>
              <strong>Login time:</strong> {loginTime || "Unavailable"}
            </p>

            <p>
              <strong>Browser:</strong> {browserInfo || "Unavailable"}
            </p>

            <p>
              <strong>Device:</strong> {deviceInfo || "Unavailable"}
            </p>

            <p className="text-xs text-gray-500 pt-2">
              This displays information about the current session only.
              Historical login records, operating system details and IP
              address tracking are not connected yet.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Link
            href="/questions"
            className="block text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            View Questions
          </Link>

          <Link
            href="/transfer"
            className="block text-center bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700"
          >
            Transfer Points
          </Link>

          <Link
            href="/"
            className="block text-center border py-3 rounded-lg hover:bg-gray-50"
          >
            Back to Home
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}
