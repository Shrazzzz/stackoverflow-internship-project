
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "crypto";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const planPrices: Record<string, number> = {
  Bronze: 100,
  Silver: 300,
  Gold: 1000,
};

function isPaymentTimeAllowed() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  return hour === 10;
}

export async function POST(request: Request) {
  try {
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

    // Check permitted payment time before activating subscription
    if (!isPaymentTimeAllowed()) {
      return NextResponse.json(
        {
          error:
            "Payment verification is allowed only between 10:00 AM and 11:00 AM IST. Contact support if your payment was already captured.",
        },
        { status: 403 }
      );
    }

    // Activate subscription
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

    // Send invoice email
    let emailSent = false;

    if (
      user.email &&
      process.env.RESEND_API_KEY &&
      process.env.RESEND_FROM_EMAIL
    ) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { error: emailError } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: user.email,
          subject: `${plan} Subscription Payment Invoice`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Payment Successful!</h2>
              <p>Hello,</p>
              <p>Your subscription has been activated successfully.</p>
              <h3>Payment Invoice</h3>
              <p><strong>Plan:</strong> ${plan}</p>
              <p><strong>Amount:</strong> ₹${expectedAmount}</p>
              <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
              <p><strong>Duration:</strong> 30 days</p>
              <p>Thank you for subscribing!</p>
            </div>
          `,
        });

        if (emailError) {
          console.error("Invoice email error:", emailError);
        } else {
          emailSent = true;
        }
      } catch (emailError) {
        console.error("Invoice email error:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
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
