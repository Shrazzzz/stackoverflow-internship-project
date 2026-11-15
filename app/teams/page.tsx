
import Link from "next/link";
import {
  Users,
  MessageSquare,
  ShieldCheck,
  BookOpen,
  FolderKanban,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";

const benefits = [
  {
    icon: MessageSquare,
    title: "Team Discussions",
    description:
      "Give team members a place to ask questions and discuss technical challenges.",
  },
  {
    icon: BookOpen,
    title: "Share Knowledge",
    description:
      "Create a shared knowledge space where useful answers and information can be discovered.",
  },
  {
    icon: ShieldCheck,
    title: "Private Collaboration",
    description:
      "Support knowledge sharing within a team through a private collaborative environment.",
  },
  {
    icon: FolderKanban,
    title: "Organize Information",
    description:
      "Keep discussions and useful information organized for easier access.",
  },
];

export default function TeamsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <section className="bg-slate-900 px-6 py-24 text-center text-white">
        <p className="font-semibold uppercase tracking-widest text-blue-400">
          For Teams
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-bold md:text-6xl">
          Bring your team's knowledge together.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
          Help your team collaborate, share technical knowledge
          and find answers in one organized space.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
        >
          Get Started <ArrowRight size={18} />
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="font-semibold text-blue-600">TEAM COLLABORATION</p>
            <h2 className="mt-3 text-3xl font-bold">
              Work together. Solve problems faster.
            </h2>
            <p className="mt-5 leading-7 text-gray-600">
              Teams work better when knowledge is shared. Our platform
              introduces a space for team members to exchange ideas,
              ask questions and learn from one another.
            </p>
            <p className="mt-4 leading-7 text-gray-600">
              Instead of keeping useful information in separate
              conversations, teams can build a more organized
              collection of knowledge.
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-10">
            <Users size={48} className="text-blue-600" />
            <h3 className="mt-5 text-2xl font-bold">
              Better Together
            </h3>
            <p className="mt-3 leading-7 text-gray-600">
              Encourage collaboration and make it easier for team
              members to learn from shared experiences.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">
              Why Use Our Team Platform?
            </h2>
            <p className="mt-3 text-gray-600">
              Features that support productive teamwork.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {benefits.map((item) => {
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
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <Lightbulb size={40} className="text-blue-600" />
            <h2 className="mt-4 text-3xl font-bold">
              How Teams Can Use the Platform
            </h2>
            <p className="mt-4 leading-7 text-gray-600">
              From solving everyday technical problems to sharing
              important project knowledge, teams can use the platform
              to improve collaboration.
            </p>
          </div>

          <div className="space-y-5">
            {[
              "Ask questions and discuss problems.",
              "Share answers and useful solutions.",
              "Organize knowledge by topics.",
              "Learn from other team members.",
            ].map((step) => (
              <div key={step} className="flex items-start gap-3">
                <CheckCircle2
                  size={23}
                  className="mt-1 shrink-0 text-green-600"
                />
                <p className="text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-600 px-6 py-16 text-center text-white">
        <h2 className="text-3xl font-bold">
          Start Building Knowledge Together
        </h2>
        <p className="mt-4 text-blue-100">
          Create an account and explore the platform.
        </p>
        <Link
          href="/register"
          className="mt-7 inline-block rounded-lg bg-white px-7 py-3 font-semibold text-blue-700 hover:bg-gray-100"
        >
          Join Now
        </Link>
      </section>
    </main>
  );
}
