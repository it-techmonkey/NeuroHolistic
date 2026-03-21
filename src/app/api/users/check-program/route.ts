import { supabase } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/users/check-program
 * 
 * Check if a user has an active program by email
 * 
 * Request body:
 * {
 *   email: string
 * }
 * 
 * Response:
 * {
 *   hasActiveProgram: boolean
 *   programId?: string
 *   sessionsRemaining?: number
 *   userId?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (userError) {
      console.error("Error querying user:", userError);
      return NextResponse.json(
        { error: "Failed to check user" },
        { status: 500 }
      );
    }

    if (!user) {
      // User doesn't exist yet, no active program
      return NextResponse.json({
        hasActiveProgram: false,
        userId: null,
      });
    }

    // Check if user has active program (used_sessions < total_sessions)
    const { data: program, error: programError } = await supabase
      .from("programs")
      .select("id, total_sessions, used_sessions, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (programError) {
      console.error("Error querying programs:", programError);
      return NextResponse.json(
        { error: "Failed to check program" },
        { status: 500 }
      );
    }

    // A program is active if sessions remain (used < total)
    const isActive = program && program.used_sessions < program.total_sessions;
    const sessionsRemaining = program ? program.total_sessions - program.used_sessions : 0;

    return NextResponse.json({
      hasActiveProgram: isActive,
      userId: user.id,
      programId: program?.id || null,
      sessionsRemaining,
      createdAt: program?.created_at || null,
    });
  } catch (error) {
    console.error("Error in check-program:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
