
"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/ui/Navbar";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Question = {
  id: number;
  title: string;
  description: string;
  tags: string[] | string | null;
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase
        .from("questions")
        .select("id, title, description, tags")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Could not load questions:", error.message);
      } else {
        setQuestions(data || []);
      }

      setLoading(false);
    }

    fetchQuestions();
  }, []);

  function formatTags(tags: Question["tags"]): string[] {
    if (Array.isArray(tags)) return tags;

    if (typeof tags === "string") {
      try {
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
      }

      return [];
    }

    return [];
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar handleslidin={() => setMenuOpen(!menuOpen)} />

      <div className="flex">
        {menuOpen && (
          <aside className="w-56 bg-white min-h-screen p-5 border-r">
            <nav className="flex flex-col gap-5">
              <Link href="/">Home</Link>
              <Link href="/questions">Questions</Link>
              <Link href="/tags">Tags</Link>
              <Link href="/users">Users</Link>
              <Link href="/public-feed">Public Feed</Link>
              <Link href="/subscription">Subscription Plans</Link>
            </nav>
          </aside>
        )}

        <main className="flex-1 max-w-5xl mx-auto p-8">
          <div className="flex justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">All Questions</h1>
              <p className="text-gray-500 mt-2">
                Explore programming questions and answers.
              </p>
            </div>

            <Link
              href="/ask-question"
              className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
            >
              Ask Question
            </Link>
          </div>

          <div className="bg-white rounded-xl border p-6 mb-5">
            <h2 className="text-xl font-semibold">
              Welcome to Stack Overflow!
            </h2>
            <p className="text-gray-600 mt-3">
              A community where developers learn, share knowledge,
              and solve programming problems together.
            </p>
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Recent Questions
            </h2>

            {loading ? (
              <div className="bg-white rounded-xl border p-6 text-gray-500">
                Loading questions...
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white rounded-xl border p-6 text-gray-600">
                No questions available yet. Be the first to ask!
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    className="bg-white rounded-xl border p-6 hover:shadow-md transition"
                  >
                    <Link
                      href={`/questions/${question.id}`}
                      className="text-xl font-semibold text-blue-700 hover:underline"
                    >
                      {question.title}
                    </Link>

                    <p className="text-gray-600 mt-3">
                      {question.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {formatTags(question.tags).map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/questions"
              className="inline-block mt-5 text-blue-600 font-semibold hover:underline"
            >
              View All Questions →
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
