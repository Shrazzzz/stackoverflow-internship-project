import Link from "next/link";

export default function TagsPage() {
  const tags = [
    "javascript",
    "react",
    "python",
    "java",
    "html",
    "css",
    "mysql",
    "nextjs",
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <Link href="/" className="text-blue-600">
        ← Home
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Popular Tags</h1>
      <p className="mt-2 text-gray-600">
        Explore topics related to programming.
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-lg border bg-white px-5 py-3 text-blue-600"
          >
            {tag}
          </span>
        ))}
      </div>
    </main>
  );
}