
import Link from "next/link";
import {
  MessageSquare,
  Users,
  BookOpen,
  Lightbulb,
  Target,
  Heart,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Ask Questions",
    description: "Ask programming and technology questions and get help from the community.",
  },
  {
    icon: BookOpen,
    title: "Share Knowledge",
    description: "Share your experience and help others solve technical problems.",
  },
  {
    icon: Users,
    title: "Connect with Developers",
    description: "Learn from other developers and become part of a knowledge-sharing community.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <section className="bg-slate-900 px-6 py-24 text-center text-white">
        <p className="mb-4 font-semibold uppercase tracking-widest text-blue-400">
          About Our Platform
        </p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold md:text-6xl">
          Where developers learn, share and grow together.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
          A community-driven platform where people can ask questions,
          share knowledge and find solutions to technical challenges.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Join Our Community <ArrowRight size={18} />
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="font-semibold text-blue-600">WHO WE ARE</p>
            <h2 className="mt-3 text-3xl font-bold">
              Helping people find answers through community knowledge.
            </h2>
            <p className="mt-5 leading-7 text-gray-600">
              Our platform is designed for developers, students and
              technology enthusiasts. It provides a space to ask
              questions, exchange ideas and learn from real experiences.
            </p>
            <p className="mt-4 leading-7 text-gray-600">
              Whether you are learning your first programming language
              or solving a complex development problem, you can learn
              and contribute here.
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-10">
            <Lightbulb size={48} className="text-blue-600" />
            <h3 className="mt-5 text-2xl font-bold">Our Mission</h3>
            <p className="mt-3 leading-7 text-gray-600">
              To make technical knowledge easier to discover, share
              and access through collaboration and community support.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">What You Can Do Here</h2>
            <p className="mt-3 text-gray-600">
              Everything you need to learn and share knowledge.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <Icon size={36} className="text-blue-600" />
                  <h3 className="mt-5 text-xl font-bold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-gray-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border p-7">
            <Target className="text-blue-600" size={34} />
            <h3 className="mt-4 text-xl font-bold">Our Vision</h3>
            <p className="mt-3 leading-7 text-gray-600">
              To create a welcoming place where everyone can contribute
              to a growing collection of useful technical knowledge.
            </p>
          </div>
          <div className="rounded-xl border p-7">
            <Heart className="text-blue-600" size={34} />
            <h3 className="mt-4 text-xl font-bold">Our Values</h3>
            <p className="mt-3 leading-7 text-gray-600">
              Collaboration, curiosity, respect, learning and helping
              others are at the heart of our community.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 px-6 py-16 text-center text-white">
        <h2 className="text-3xl font-bold">Be Part of the Community</h2>
        <p className="mt-4 text-blue-100">
          Start asking questions and sharing what you know.
        </p>
        <Link
          href="/register"
          className="mt-7 inline-block rounded-lg bg-white px-7 py-3 font-semibold text-blue-700 hover:bg-gray-100"
        >
          Get Started
        </Link>
      </section>
    </main>
  );
}
