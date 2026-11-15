
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AskQuestionPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (title.trim().length < 15) {
      alert("Question title must contain at least 15 characters.");
      return;
    }

    if (description.trim().length < 30) {
      alert("Please provide more details about your question.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        alert("Please log in before submitting a question.");
        return;
      }

      const questionTags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const { data, error } = await supabase.rpc(
        "submit_question_with_limit",
        {
          p_title: title.trim(),
          p_description: description.trim(),
          p_tags: JSON.stringify(questionTags),
        }
      );

      if (error) {
        alert(error.message);
        return;
      }

      console.log("Submitted question:", data);

      alert("Your question has been submitted successfully!");

      setTitle("");
      setDescription("");
      setTags("");

      router.push("/questions");
    } catch (error) {
      console.error("Question submission error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Could not submit your question."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600">
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold mt-6 mb-3">
          Ask a public question
        </h1>

        <p className="text-gray-600 mb-6">
          Include all the information someone would need to answer your question.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-xl p-6 space-y-5"
        >
          <div>
            <label className="font-semibold block mb-2">
              Title
            </label>

            <p className="text-sm text-gray-500 mb-2">
              Be specific and imagine you are asking another developer.
            </p>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How do I use useState in React?"
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain your programming problem..."
              rows={7}
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Tags
            </label>

            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, javascript, python"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Question"}
          </button>
        </form>
      </div>
    </div>
  );
}
