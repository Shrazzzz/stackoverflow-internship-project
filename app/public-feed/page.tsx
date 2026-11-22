
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Comment = {
  id: number;
  post_id: number;
  user_id: string;
  comment: string;
  created_at: string;
};

type Post = {
  id: number;
  user_id: string;
  content: string;
  media_url?: string | null;
  media_type?: string | null;
  created_at: string;
  likes?: number;
  liked?: boolean;
  comments?: Comment[];
};

export default function PublicFeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setFeedLoading(true);

    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!auth.user) {
        setMessage("Please log in to view and create posts.");
        return;
      }

      setUserId(auth.user.id);

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const postList = data || [];

      const { data: likes, error: likesError } = await supabase
        .from("post_likes")
        .select("post_id, user_id");

      if (likesError) throw likesError;

      const { data: comments, error: commentsError } = await supabase
        .from("post_comments")
        .select("*")
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      setPosts(
        postList.map((post) => ({
          ...post,
          likes:
            likes?.filter((like) => like.post_id === post.id).length || 0,
          liked:
            likes?.some(
              (like) =>
                like.post_id === post.id && like.user_id === auth.user.id
            ) || false,
          comments:
            comments?.filter((comment) => comment.post_id === post.id) || [],
        }))
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load posts."
      );
    } finally {
      setFeedLoading(false);
    }
  }

  function handleFileChange(selectedFile: File | null) {
    if (preview) URL.revokeObjectURL(preview);

    setFile(selectedFile);
    setPreview("");

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  }

  async function createPost() {
    if (!content.trim() && !file) {
      setMessage("Write something or select a photo/video.");
      return;
    }

    if (!userId) {
      setMessage("Please log in first.");
      return;
    }

    if (file) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        setMessage("Only images and videos are allowed.");
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setMessage("File size must be below 50 MB.");
        return;
      }
    }

    setLoading(true);
    setMessage("");

    try {
      let mediaUrl: string | null = null;
      let mediaType: string | null = null;

      if (file) {
        const extension = file.name.split(".").pop() || "file";
        const filePath = `${userId}/${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(filePath, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("posts")
          .getPublicUrl(filePath);

        mediaUrl = publicData.publicUrl;
        mediaType = file.type.startsWith("image/") ? "image" : "video";
      }

      const { error } = await supabase.from("posts").insert({
        user_id: userId,
        content: content.trim(),
        media_url: mediaUrl,
        media_type: mediaType,
      });

      if (error) throw error;

      handleFileChange(null);
      setContent("");
      setMessage("Post published successfully!");
      await loadPosts();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create post."
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleLike(post: Post) {
    if (!userId) {
      setMessage("Please log in first.");
      return;
    }

    if (post.liked) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", userId);

      if (error) {
        setMessage(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("post_likes").insert({
        post_id: post.id,
        user_id: userId,
      });

      if (error) {
        setMessage(error.message);
        return;
      }
    }

    await loadPosts();
  }

  async function addComment(postId: number) {
    const commentText = commentDrafts[postId]?.trim();

    if (!commentText || !userId) {
      setMessage("Please enter a comment first.");
      return;
    }

    const { error } = await supabase.from("post_comments").insert({
      post_id: postId,
      user_id: userId,
      comment: commentText,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
    setMessage("Comment added successfully!");
    await loadPosts();
  }

  const getShareUrl = (post: Post) => {
      return `${window.location.origin}/shared-post/${post.id}`;
  };

  function sharePost(post: Post) {
    setSelectedPost(post);
  }

  function openShareWebsite(platform: string) {
    if (!selectedPost) return;

    const shareUrl = getShareUrl(selectedPost);
    const shareText = selectedPost.content || "Check out this post!";

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    const shareLinks: Record<string, string> = {
      whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(
        "Check out this post"
      )}&body=${encodedText}%0A%0A${encodedUrl}`,
    };

    const link = shareLinks[platform];

    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  }

  async function copyPostLink() {
    if (!selectedPost) return;

    const shareUrl = getShareUrl(selectedPost);
    setCopying(true);

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        setMessage("Post link copied successfully!");
        setSelectedPost(null);
      } else {
        window.prompt("Copy this post link:", shareUrl);
      }
    } catch (error) {
      console.error("Copy error:", error);
      window.prompt("Copy this post link:", shareUrl);
    } finally {
      setCopying(false);
    }
  }

  async function deletePost(post: Post) {
    if (post.user_id !== userId) return;
    if (!window.confirm("Delete this post?")) return;

    if (post.media_url) {
      const marker = "/storage/v1/object/public/posts/";
      const filePath = post.media_url.split(marker)[1];

      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from("posts")
          .remove([decodeURIComponent(filePath)]);

        if (storageError) {
          setMessage(storageError.message);
          return;
        }
      }
    }

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id)
      .eq("user_id", userId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Post deleted.");
    await loadPosts();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-blue-600">
          ← Home
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Public Feed</h1>

        <p className="mt-2 text-gray-600">
          Share your thoughts, photos and videos with the community.
        </p>

        {message && (
          <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            {message}
          </div>
        )}

        <section className="mt-6 rounded-lg border bg-white p-5">
          <h2 className="mb-3 text-lg font-semibold">Create a post</h2>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full rounded-lg border p-3"
            rows={3}
          />

          <input
            type="file"
            accept="image/*,video/*"
            className="mt-4 block w-full"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />

          {preview && file && (
            <div className="mt-4">
              {file.type.startsWith("image/") ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-72 rounded-lg"
                />
              ) : (
                <video
                  src={preview}
                  controls
                  className="max-h-72 w-full rounded-lg"
                />
              )}

              <button
                type="button"
                onClick={() => handleFileChange(null)}
                className="mt-2 text-sm text-red-600"
              >
                Remove selected file
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={createPost}
            disabled={loading}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Post"}
          </button>
        </section>

        <div className="mt-6 space-y-4">
          {feedLoading ? (
            <p className="text-center text-gray-500">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="rounded-lg bg-white p-5 text-center text-gray-500">
              No posts yet. Be the first to share something!
            </p>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                id={`post-${post.id}`}
                className="rounded-lg border bg-white p-5"
              >
                <p className="text-xs text-gray-500">
                  {new Date(post.created_at).toLocaleString()}
                </p>

                <p className="mt-3 whitespace-pre-wrap">{post.content}</p>

                {post.media_url && post.media_type === "image" && (
                  <img
                    src={post.media_url}
                    alt="Post image"
                    className="mt-4 max-h-96 w-full rounded-lg object-contain"
                  />
                )}

                {post.media_url && post.media_type === "video" && (
                  <video
                    src={post.media_url}
                    controls
                    className="mt-4 max-h-96 w-full rounded-lg"
                  />
                )}

                <div className="mt-4 flex flex-wrap items-center gap-5 border-b pb-4">
                  <button
                    type="button"
                    onClick={() => toggleLike(post)}
                    className="cursor-pointer rounded-lg px-2 py-1 text-blue-600 hover:bg-blue-50"
                  >
                    {post.liked ? "Unlike" : "Like"} ({post.likes || 0})
                  </button>

                  <button
                    type="button"
                    onClick={() => sharePost(post)}
                    className="cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  >
                    Share
                  </button>

                  {post.user_id === userId && (
                    <button
                      type="button"
                      onClick={() => deletePost(post)}
                      className="cursor-pointer rounded-lg px-2 py-1 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold">
                    Comments ({post.comments?.length || 0})
                  </h3>

                  {post.comments?.map((comment) => (
                    <p
                      key={comment.id}
                      className="mt-2 rounded-lg bg-gray-50 p-2 text-sm text-gray-700"
                    >
                      {comment.comment}
                    </p>
                  ))}

                  <div className="mt-3 flex gap-2">
                    <input
                      value={commentDrafts[post.id] || ""}
                      onChange={(e) =>
                        setCommentDrafts((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      placeholder="Write a comment..."
                      className="min-w-0 flex-1 rounded-lg border p-2"
                    />

                    <button
                      type="button"
                      onClick={() => addComment(post.id)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Share Post</h2>

              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="text-2xl text-gray-500 hover:text-black"
              >
                ×
              </button>
            </div>

            <p className="mb-5 text-sm text-gray-600">
              Choose where you want to share this post.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => openShareWebsite("whatsapp")}
                className="rounded-lg bg-green-500 p-3 font-medium text-white hover:bg-green-600"
              >
                WhatsApp
              </button>

              <button
                type="button"
                onClick={() => openShareWebsite("gmail")}
                className="rounded-lg bg-red-500 p-3 font-medium text-white hover:bg-red-600"
              >
                Gmail
              </button>

              <button
                type="button"
                onClick={() => openShareWebsite("facebook")}
                className="rounded-lg bg-blue-600 p-3 font-medium text-white hover:bg-blue-700"
              >
                Facebook
              </button>

              <button
                type="button"
                onClick={() => openShareWebsite("telegram")}
                className="rounded-lg bg-sky-500 p-3 font-medium text-white hover:bg-sky-600"
              >
                Telegram
              </button>

              <button
                type="button"
                onClick={() => openShareWebsite("twitter")}
                className="rounded-lg bg-black p-3 font-medium text-white hover:bg-gray-800"
              >
                X (Twitter)
              </button>

              <button
                type="button"
                onClick={copyPostLink}
                disabled={copying}
                className="rounded-lg bg-gray-700 p-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {copying ? "Copying..." : "Copy Link"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="mt-5 w-full rounded-lg border p-3 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
