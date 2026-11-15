
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function QuestionDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [myVotes, setMyVotes] = useState<number[]>([]);

  async function fetchVotes(currentUserId: string) {
    const { data, error } = await supabase
      .from("votes")
      .select("answer_id, user_id");

    if (error) {
      setError(error.message);
      return;
    }

    const counts: Record<number, number> = {};
    const votedAnswers: number[] = [];

    (data || []).forEach((vote) => {
      const answerId = Number(vote.answer_id);

      counts[answerId] = (counts[answerId] || 0) + 1;

      if (vote.user_id === currentUserId) {
        votedAnswers.push(answerId);
      }
    });

    setVotes(counts);
    setMyVotes(votedAnswers);
  }

  async function fetchAnswers(currentUserId: string) {
    const { data, error } = await supabase
      .from("answers")
      .select("*")
      .eq("question_id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setAnswers(data || []);
    await fetchVotes(currentUserId);
  }

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();

      const currentUserId = user?.id || "";
      setUserId(currentUserId);

      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setQuestion(data);

      await fetchAnswers(currentUserId);

      setLoading(false);
    }

    fetchData();
  }, [id]);

  async function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!userId) {
      setError("Please log in to submit an answer.");
      return;
    }

    const { error } = await supabase.from("answers").insert({
      question_id: Number(id),
      content: answer,
      user_id: userId,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setAnswer("");
    await fetchAnswers(userId);
  }

  async function handleUpvote(answerId: number) {
    setError("");

    if (!userId) {
      setError("Please log in to upvote.");
      return;
    }

    const alreadyVoted = myVotes.includes(answerId);

    if (alreadyVoted) {
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("answer_id", answerId)
        .eq("user_id", userId);

      if (error) {
        setError(error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("votes")
        .insert({
          answer_id: answerId,
          user_id: userId,
        });

      if (error) {
        setError(error.message);
        return;
      }
    }

    await fetchVotes(userId);
  }

  if (loading) {
    return <p className="p-8">Loading question...</p>;
  }

  if (!question) {
    return <p className="p-8">{error || "Question not found."}</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <Link
        href="/questions"
        className="text-blue-600 hover:underline"
      >
        ← All Questions
      </Link>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          {question.title}
        </h1>

        <p className="mt-4 leading-7 text-gray-600">
          {question.description}
        </p>

        <h2 className="mt-8 text-xl font-bold">
          Answers ({answers.length})
        </h2>

        {answers.length === 0 ? (
          <p className="mt-4 text-gray-500">
            No answers yet. Be the first to answer!
          </p>
        ) : (
          answers.map((item) => (
            <div
              key={item.id}
              className="mt-4 rounded-lg bg-gray-50 p-4"
            >
              <p className="text-gray-800">
                {item.content}
              </p>

              <button
                type="button"
                onClick={() => handleUpvote(Number(item.id))}
                className={`mt-3 rounded-lg border px-4 py-2 ${
                  myVotes.includes(Number(item.id))
                    ? "border-blue-600 bg-blue-100 text-blue-700"
                    : "border-gray-300 text-gray-600 hover:bg-blue-50"
                }`}
              >
                👍 {myVotes.includes(Number(item.id))
                  ? "Upvoted"
                  : "Upvote"}{" "}
                ({votes[Number(item.id)] || 0})
              </button>
            </div>
          ))
        )}

        <form onSubmit={submitAnswer} className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">
            Your Answer
          </h2>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
            className="w-full rounded-lg border p-3"
            rows={5}
            placeholder="Write your answer..."
          />

          {error && (
            <p className="mt-2 text-red-600">{error}</p>
          )}

          <button
            type="submit"
            className="mt-4 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Submit Answer
          </button>
        </form>
      </div>
    </main>
  );
}
