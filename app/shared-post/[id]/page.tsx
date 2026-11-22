
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type SharedPost = {
  id: number;
  content: string;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
};

export default function SharedPostPage() {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<SharedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPost() {
      try {
        const response = await fetch(`/api/shared-post/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load post");
        }

        setPost(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) loadPost();
  }, [id]);

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center">Loading post...</main>;
  }

  if (error || !post) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-600">{error || "Post not found"}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-5">
        <h1 className="text-xl font-bold mb-4">Shared Post</h1>

        <p className="text-gray-800 whitespace-pre-wrap mb-4">
          {post.content}
        </p>

        {post.media_url && post.media_type?.startsWith("image/") && (
          <img
            src={post.media_url}
            alt="Shared post"
            className="w-full rounded-lg mb-4"
          />
        )}

        {post.media_url && post.media_type?.startsWith("video/") && (
          <video
            src={post.media_url}
            controls
            className="w-full rounded-lg mb-4"
          />
        )}

        <p className="text-sm text-gray-500">
          Posted on {new Date(post.created_at).toLocaleString()}
        </p>
      </div>
    </main>
  );
}
