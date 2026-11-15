
import Link from "next/link";
import {
  MessageSquare,
  Tags,
  Users,
  UserCircle,
  CreditCard,
  ArrowRight,
  Search,
  BookOpen,
} from "lucide-react";

const products = [
  {
    icon: MessageSquare,
    title: "Questions & Answers",
    description:
      "Ask technical questions, share solutions and learn from answers provided by other members.",
    tag: "Knowledge Sharing",
  },
  {
    icon: Tags,
    title: "Topics & Tags",
    description:
      "Organize questions using relevant tags so users can discover topics that interest them.",
    tag: "Easy Discovery",
  },
  {
    icon: Users,
    title: "Public Community Feed",
    description:
      "Explore community posts, share updates and participate in knowledge-sharing discussions.",
    tag: "Community",
  },
  {
    icon: UserCircle,
    title: "User Profiles",
    description:
      "Build your developer profile and keep track of your questions, answers and contributions.",
    tag: "Your Profile",
  },
  {
    icon: CreditCard,
    title: "Subscription Plans",
    description:
      "Explore membership plans designed around different usage needs and platform benefits.",
    tag: "Membership",
  },
  {
    icon: Search,
    title: "Search & Explore",
    description:
      "Find useful questions and explore technical topics from across the platform.",
    tag: "Find Solutions",
  },
];

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <section className="bg-slate-900 px-6 py-24 text-center text-white">
        <p className="font-semibold uppercase tracking-widest text-blue-400">
          Our Products
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-bold md:text-6xl">
          Tools that make sharing knowledge easier.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
          Discover features designed to help developers ask questions,
          find answers and connect with a learning community.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
        >
          Explore the Platform <ArrowRight size={18} />
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <p className="font-semibold text-blue-600">PLATFORM FEATURES</p>
          <h2 className="mt-3 text-3xl font-bold">
            Everything in One Place
          </h2>
          <p className="mt-3 text-gray-600">
            Explore the different parts of our knowledge-sharing platform.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-gray-200 p-7 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                  <Icon size={30} className="text-blue-600" />
                </div>
                <p className="mt-5 text-sm font-semibold text-blue-600">
                  {item.tag}
                </p>
                <h3 className="mt-2 text-xl font-bold">{item.title}</h3>
                <p className="mt-3 leading-7 text-gray-600">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <BookOpen size={42} className="text-blue-600" />
            <h2 className="mt-5 text-3xl font-bold">
              Learn. Contribute. Grow.
            </h2>
            <p className="mt-4 leading-7 text-gray-600">
              Our platform brings questions, answers, topics and
              community discussions together. It is designed to make
              technical learning and collaboration more accessible.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800"
            >
              Log in to your account <ArrowRight size={18} />
            </Link>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-bold">A place for every learner</h3>
            <ul className="mt-6 space-y-4 text-gray-600">
              <li>✓ Ask questions and receive answers</li>
              <li>✓ Explore topics through tags</li>
              <li>✓ Participate in community discussions</li>
              <li>✓ Track your contributions through your profile</li>
              <li>✓ Explore available subscription plans</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 px-6 py-16 text-center text-white">
        <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
        <p className="mt-4 text-blue-100">
          Join the community and start your knowledge-sharing journey.
        </p>
        <Link
          href="/register"
          className="mt-7 inline-block rounded-lg bg-white px-7 py-3 font-semibold text-blue-700 hover:bg-gray-100"
        >
          Create an Account
        </Link>
      </section>
    </main>
  );
}
