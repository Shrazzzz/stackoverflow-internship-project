
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
    // Authenticate user
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

    // Validate plan
    const { plan } = await request.json();
    const amount = planPrices[plan];

    if (!amount) {
      return NextResponse.json(
        { error: "Invalid subscription plan." },
        { status: 400 }
      );
    }

    // Allow payments only from 10 AM to 11 AM IST
    const currentTime = new Date();

    const istTime = new Date(
      currentTime.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      })
    );

    const hour = istTime.getHours();

    if (hour !== 10) {
      return NextResponse.json(
        {
          error:
            "Payments are allowed only between 10:00 AM and 11:00 AM IST. Please try again during the permitted time.",
        },
        { status: 403 }
      );
    }

    // Razorpay configuration
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error("Razorpay configuration is missing.");
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Create payment order
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `sub_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        user_id: user.id,
        plan_name: plan,
      },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      { error: "Could not create payment order." },
      { status: 500 }
    );
  }
}
