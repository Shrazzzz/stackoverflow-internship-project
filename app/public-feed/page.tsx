import Link from "next/link";

export default function PublicFeedPage() {
  const posts = [
    {
      user: "Rahul",
      content: "I recently learned React components. What are your favourite React resources?",
    },
    {
      user: "Priya",
      content: "Sharing a Python tip: use list comprehensions to write cleaner code!",
    },
    {
      user: "Arun",
      content: "What is the difference between JavaScript and TypeScript?",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <Link href="/" className="text-blue-600">
        ← Home
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Public Feed</h1>
      <p className="mt-2 text-gray-600">
        See what the community is sharing.
      </p>

      <div className="mt-6 space-y-4">
        {posts.map((post, index) => (
          <div key={index} className="rounded-lg border bg-white p-6">
            <h2 className="font-semibold">{post.user}</h2>
            <p className="mt-3 text-gray-700">{post.content}</p>
          </div>
        ))}
      </div>
    </main>
  );
}