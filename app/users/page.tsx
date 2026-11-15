import Link from "next/link";

export default function UsersPage() {
  const users = [
    { name: "Rahul", role: "JavaScript Developer" },
    { name: "Priya", role: "Python Developer" },
    { name: "Arun", role: "React Developer" },
    { name: "Sneha", role: "Java Developer" },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <Link href="/" className="text-blue-600">
        ← Home
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Community Users</h1>
      <p className="mt-2 text-gray-600">
        Explore developers in our community.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {users.map((user) => (
          <div key={user.name} className="rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="mt-2 text-gray-600">{user.role}</p>
          </div>
        ))}
      </div>
    </main>
  );
}