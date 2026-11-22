
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!/^\d+$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid post ID" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("posts")
      .select("id, content, media_url, media_type, created_at")
      .eq("id", Number(id))
      .maybeSingle();

    if (error) {
      console.error("Shared post Supabase error:", error);

      return NextResponse.json(
      { error: error.message },
      { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
