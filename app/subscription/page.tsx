
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const plans = [
  {
    name: "Free",
    price: "₹0",
    limit: "1 question per day",
    features: ["Ask 1 question daily", "View answers", "Basic access"],
  },
  {
    name: "Bronze",
    price: "₹100",
    limit: "5 questions per day",
    features: ["Ask 5 questions daily", "View answers", "Standard access"],
  },
  {
    name: "Silver",
    price: "₹300",
    limit: "10 questions per day",
    features: ["Ask 10 questions daily", "View answers", "Priority access"],
  },
  {
    name: "Gold",
    price: "₹1,000",
    limit: "Unlimited questions",
    features: ["Unlimited questions", "View answers", "Premium access"],
  },
];

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (
    event: string,
    callback: (response: {
      error?: { description?: string };
    }) => void
  ) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () =>
        resolve(!!window.Razorpay)
      );
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(!!window.Razorpay);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingPlan, setPayingPlan] = useState("");

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError("Please log in to view your subscription.");
          return;
        }

        const { data: subscription, error: subscriptionError } =
          await supabase
            .from("user_subscriptions")
            .select("plan_name, expires_at")
            .eq("user_id", user.id)
            .maybeSingle();

        if (subscriptionError) {
          throw subscriptionError;
        }

        let activePlan = subscription?.plan_name || "Free";

        if (
          subscription?.expires_at &&
          new Date(subscription.expires_at) <= new Date()
        ) {
          activePlan = "Free";
        }

        setCurrentPlan(activePlan);

        const today = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());

        const start = new Date(
          `${today}T00:00:00+05:30`
        ).toISOString();

        const end = new Date(
          new Date(start).getTime() + 24 * 60 * 60 * 1000
        ).toISOString();

        const { count, error: countError } = await supabase
          .from("questions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", start)
          .lt("created_at", end);

        if (countError) {
          throw countError;
        }

        setQuestionsUsed(count || 0);
      } catch (err) {
        console.error("Subscription loading error:", err);
        setError("Could not load subscription details.");
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, []);

  const handleSubscribe = async (planName: string) => {
    try {
      setPayingPlan(planName);

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Could not load Razorpay checkout. Please try again.");
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Please log in again before making a payment.");
      }

      // Create Razorpay order on the server
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: planName }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Could not create payment order.");
      }

      const options: RazorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Stackoverflow Internship Project",
        description: `${planName} Subscription`,
        order_id: orderData.order_id,

        handler: async (response) => {
          try {
            const verificationResponse = await fetch(
              "/api/verify-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(response),
              }
            );

            const verificationData =
              await verificationResponse.json();

            if (!verificationResponse.ok) {
              throw new Error(
                verificationData.error || "Payment verification failed."
              );
            }

            setCurrentPlan(planName);
            alert(verificationData.message);
          } catch (verificationError) {
            console.error(verificationError);
            alert(
              verificationError instanceof Error
                ? verificationError.message
                : "Payment verification failed."
            );
          } finally {
            setPayingPlan("");
          }
        },

        modal: {
          ondismiss: () => {
            setPayingPlan("");
          },
        },

        theme: {
          color: "#2563eb",
        },
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", (response) => {
        alert(
          response.error?.description || "Payment failed. Please try again."
        );
        setPayingPlan("");
      });

      checkout.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setPayingPlan("");
    }
  };

  const dailyLimit =
    currentPlan === "Gold"
      ? null
      : currentPlan === "Silver"
      ? 10
      : currentPlan === "Bronze"
      ? 5
      : 1;

  const remaining =
    dailyLimit === null
      ? "Unlimited"
      : Math.max(dailyLimit - questionsUsed, 0);

  return (
    <main className="min-h-screen bg-gray-100 px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>

        <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Choose Your Subscription Plan
        </h1>

        <p className="mt-3 text-center text-gray-600">
          Select a plan based on your daily question requirements.
        </p>

        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Your Subscription Details
          </h2>

          {loading ? (
            <p className="mt-4 text-gray-500">Loading your details...</p>
          ) : error ? (
            <p className="mt-4 text-red-600">{error}</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">Current Plan</p>
                <p className="text-xl font-bold text-blue-600">
                  {currentPlan}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Questions Used Today
                </p>
                <p className="text-xl font-bold">{questionsUsed}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Questions Remaining Today
                </p>
                <p className="text-xl font-bold text-green-600">
                  {remaining}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-gray-900">
                {plan.name}
              </h2>

              <p className="mt-4 text-3xl font-bold text-blue-600">
                {plan.price}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                {plan.limit}
              </p>

              <ul className="mt-6 space-y-3 text-sm text-gray-700">
                {plan.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>

              <button
                type="button"
                disabled={loading || !!error || payingPlan !== ""}
                onClick={() => {
                  if (plan.name === currentPlan) {
                    alert("This is your current plan.");
                  } else if (plan.name === "Free") {
                    alert(
                      "Your Free plan will be available when your paid subscription expires."
                    );
                  } else {
                    handleSubscribe(plan.name);
                  }
                }}
                className="mt-8 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {payingPlan === plan.name
                  ? "Processing..."
                  : plan.name === currentPlan
                  ? "Current Plan"
                  : plan.name === "Free"
                  ? "Free Plan"
                  : "Subscribe Now"}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Payments are available between 10:00 AM and 11:00 AM IST.
          Paid plans activate only after successful server-side payment verification.
        </p>
      </div>
    </main>
  );
}
