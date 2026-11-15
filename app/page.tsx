
"use client";

import { useState } from "react";
import Navbar from "../components/ui/Navbar";
import Link from "next/link";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar handleslidin={() => setMenuOpen(!menuOpen)} />

      <div className="flex">
        {menuOpen && (
          <aside className="w-56 bg-white min-h-screen p-5 border-r">
            <nav className="flex flex-col gap-5">
               <a href="/" className="hover:text-blue-600">Home</a>
               <a href="/questions" className="hover:text-blue-600">Questions</a>
               <a href="/tags" className="hover:text-blue-600">Tags</a>
               <a href="/users" className="hover:text-blue-600">Users</a>
               <a href="/public-feed" className="hover:text-blue-600">Public Feed</a>
               <a href="/subscription" className="hover:text-blue-600">Subscription Plans</a>
            </nav>
          </aside>
        )}

        <main className="flex-1 max-w-5xl mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">All Questions</h1>
              <p className="text-gray-500 mt-2">
                Explore programming questions and answers.
              </p>
            </div>

            <Link
                 href="/ask-question"
                 className="bg-blue-600 text-white px-5 py-3 rounded-lg"
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

          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xl font-semibold">
              How do I get started with React.js?
            </h2>

            <p className="text-gray-600 mt-3">
              I am learning React and want to understand components,
              props and state. Can someone explain?
            </p>

            <div className="flex gap-5 text-sm text-gray-500 mt-5">
              <span>12 votes</span>
              <span>4 answers</span>
              <span>react · javascript</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
