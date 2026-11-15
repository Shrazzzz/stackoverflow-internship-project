
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Post = {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
};

type Like = {
  id: number;
  post_id: number;
  user_id: string;
};

type Profile = {
  id: string;
  full_name: string;
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPosts = async () => {
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (postError) {
      setError(postError.message);
      return;
    }

    const postsList = postData ?? [];
    setPosts(postsList);

    const userIds = [...new Set(postsList.map((post) => post.user_id))];

    if (userIds.length > 0) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      if (profileError) {
        setError(profileError.message);
        return;
      }

      const profileMap: Record<string, string> = {};

      (profileData ?? []).forEach((profile: Profile) => {
        profileMap[profile.id] = profile.full_name;
      });

      setProfiles(profileMap);
    } else {
      setProfiles({});
    }

    const { data: likeData, error: likeError } = await supabase
      .from("post_likes")
      .select("*");

    if (likeError) {
      setError(likeError.message);
      return;
    }

    setLikes(likeData ?? []);
  };

  useEffect(() => {
    const initialize = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setUserId(data.user.id);
        await loadPosts();
      } else {
        setError("Please log in to view the feed.");
      }
    };

    initialize();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!content.trim()) {
      setError("Please enter something before posting.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("posts").insert({
      user_id: userId,
      content: content.trim(),
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setContent("");
    setMessage("Your post was published!");
    await loadPosts();
  };

  const handleLike = async (postId: number) => {
    setError("");

    const existingLike = likes.find(
      (like) => like.post_id === postId && like.user_id === userId
    );

    if (existingLike) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("id", existingLike.id);

      if (error) {
        setError(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("post_likes").insert({
        post_id: postId,
        user_id: userId,
      });

      if (error) {
        setError(error.message);
        return;
      }
    }

    await loadPosts();
  };

  const handleDelete = async (postId: number) => {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", userId);

    if (error) {
      setError(error.message);
      return;
    }

    await loadPosts();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold text-orange-600 mb-6">
          Public Social Feed
        </h1>

        <form
          onSubmit={handlePost}
          className="bg-white rounded-xl shadow p-5 mb-6"
        >
          <h2 className="text-xl font-semibold mb-3">
            Create a Post
          </h2>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="What's on your mind?"
            className="w-full border rounded-lg p-3"
          />

          <p className="text-sm text-gray-500 text-right mt-1">
            {content.length}/1000
          </p>

          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          {message && <p className="text-green-600 text-sm mt-2">{message}</p>}

          <button
            type="submit"
            disabled={loading || !userId}
            className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Post"}
          </button>
        </form>

        <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>

        {posts.length === 0 ? (
          <p className="text-gray-500 bg-white p-5 rounded-lg">
            No posts yet. Be the first to share something!
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const postLikes = likes.filter(
                (like) => like.post_id === post.id
              );

              const isLiked = postLikes.some(
                (like) => like.user_id === userId
              );

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-xl shadow p-5"
                >
                  <p className="text-sm font-semibold text-blue-700 mb-3">
                    {profiles[post.user_id] || "User"}
                  </p>

                  <p className="text-gray-800 whitespace-pre-wrap">
                    {post.content}
                  </p>

                  <p className="text-xs text-gray-400 mt-4">
                    {new Date(post.created_at).toLocaleString()}
                  </p>

                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`font-medium ${
                        isLiked ? "text-red-600" : "text-gray-600"
                      }`}
                    >
                      {isLiked ? "❤️ Liked" : "🤍 Like"}
                    </button>

                    <span className="text-sm text-gray-500">
                      {postLikes.length} likes
                    </span>
                  </div>

                  {post.user_id === userId && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 text-sm mt-3 hover:underline"
                    >
                      Delete Post
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
