
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const planPrices: Record<string, number> = {
  Bronze: 100,
  Silver: 300,
  Gold: 1000,
};

export async function POST(request: Request) {
  try {
    // Verify the logged-in user
    const token = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } =
      await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid login session." },
        { status: 401 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json();

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !/^[a-f0-9]{64}$/i.test(razorpay_signature)
    ) {
      return NextResponse.json(
        { error: "Missing or invalid payment details." },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new Error("Razorpay secret is not configured.");
    }

    // Verify Razorpay signature
    const expectedSignature = createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest();

    const receivedSignature = Buffer.from(
      razorpay_signature,
      "hex"
    );

    if (
      expectedSignature.length !== receivedSignature.length ||
      !timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      return NextResponse.json(
        { error: "Payment signature verification failed." },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: secret,
    });

    // Verify order and payment directly with Razorpay
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    const plan = order.notes?.plan_name;
    const expectedAmount = planPrices[plan || ""];

    if (
      order.notes?.user_id !== user.id ||
      !expectedAmount ||
      order.amount !== expectedAmount * 100 ||
      order.currency !== "INR" ||
      payment.order_id !== razorpay_order_id ||
      payment.amount !== expectedAmount * 100 ||
      payment.currency !== "INR" ||
      payment.status !== "captured"
    ) {
      return NextResponse.json(
        { error: "Payment details could not be verified." },
        { status: 400 }
      );
    }

        const { error: activationError } = await supabaseAdmin.rpc(
      "activate_subscription_after_payment",
      {
        p_user_id: user.id,
        p_plan_name: plan,
        p_payment_id: razorpay_payment_id,
      }
    );

    if (activationError) {
      console.error("Subscription activation error:", activationError);

      return NextResponse.json(
        { error: "Payment verified, but subscription activation failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${plan} plan activated successfully for 30 days.`,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      { error: "Could not verify payment." },
      { status: 500 }
    );
  }
}
