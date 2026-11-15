
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Question = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  answers: number;
};

function formatTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // Treat ordinary text as comma-separated tags.
    }

    return value.split(",").map((tag) => tag.trim()).filter(Boolean);
  }

  return [];
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      setError("");

      const { data, error: questionError } = await supabase
        .from("questions")
        .select("id, title, description, tags, created_at")
        .order("created_at", { ascending: false });

      if (questionError) {
        setError(questionError.message);
        setLoading(false);
        return;
      }

      const { data: answerData, error: answerError } = await supabase
        .from("answers")
        .select("question_id");

      if (answerError) {
        console.error("Could not load answer counts:", answerError.message);
      }

      const answerCounts: Record<number, number> = {};

      (answerData || []).forEach((answer) => {
        answerCounts[Number(answer.question_id)] =
          (answerCounts[Number(answer.question_id)] || 0) + 1;
      });

      const seen = new Set<string>();

      const formattedQuestions = (data || [])
        .filter((question) => {
          const duplicateKey =
            `${question.title?.trim().toLowerCase()}-${question.description?.trim().toLowerCase()}`;

          if (seen.has(duplicateKey)) return false;
          seen.add(duplicateKey);
          return true;
        })
        .map((question) => ({
          id: Number(question.id),
          title: question.title,
          description: question.description,
          tags: formatTags(question.tags),
          answers: answerCounts[Number(question.id)] || 0,
        }));

      setQuestions(formattedQuestions);
      setLoading(false);
    }

    fetchQuestions();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <Link href="/" className="text-blue-600 hover:underline">
        ← Home
      </Link>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            All Questions
          </h1>
          <p className="mt-2 text-gray-600">
            Explore questions shared by the community.
          </p>
        </div>

        <Link
          href="/ask-question"
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Ask Question
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500">
            Loading questions...
          </div>
        ) : error ? (
          <div className="rounded-xl bg-white p-8 text-center text-red-600">
            Could not load questions: {error}
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-600">
            No questions have been submitted yet. Be the first to ask!
          </div>
        ) : (
          questions.map((question) => (
            <div
              key={question.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <Link
                 href={`/questions/${question.id}`}
                 className="text-xl font-semibold text-blue-700 hover:underline"
              >
               {question.title}
              </Link>

              <p className="mt-3 leading-7 text-gray-600">
                {question.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {question.tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="mt-4 text-sm text-gray-500">
                {question.answers} answers
              </p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
