
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const planPrices: Record<string, number> = {
  Bronze: 100,
  Silver: 300,
  Gold: 1000,
};

export async function POST(request: Request) {
  try {
    // Authenticate the logged-in user
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid login session." },
        { status: 401 }
      );
    }

    // Validate subscription plan
    const { plan } = await request.json();
    const amount = planPrices[plan];

    if (!amount) {
      return NextResponse.json(
        { error: "Invalid subscription plan." },
        { status: 400 }
      );
    }

    // TEMPORARILY DISABLED: 10 AM–11 AM payment restriction

    // Safe Razorpay configuration diagnostics
    console.log("Razorpay config check:", {
      keyIdPresent: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      keyIdPrefix: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.slice(0, 8),
      secretPresent: !!process.env.RAZORPAY_KEY_SECRET,
      secretLength: process.env.RAZORPAY_KEY_SECRET?.length,
    });

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `sub_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        user_id: user.id,
        plan_name: plan,
      },
    });

    console.log("Razorpay order created:", order.id);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      { error: "Could not create payment order." },
      { status: 500 }
    );
  }
}
