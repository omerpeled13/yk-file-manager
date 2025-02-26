import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// ✅ Secure admin client (ONLY for server use)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⛔ NEVER expose this in frontend
    { auth: { persistSession: false } }
);


// ✅ UPDATE a user by ID
export async function PATCH(req: Request, { params }: { params: { userId: string } }) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { verified } = await req.json(); // Expecting { verified: true/false }
        if (verified) {
            supabase.auth.updateUser({ data: { isOtpVerified: true, otpVerifiedAt: new Date().toISOString() } });
            return NextResponse.json({ message: "verified otp" });
        }
        if (!verified) {
            supabase.auth.updateUser({ data: { isOtpVerified: false} });
            return NextResponse.json({ message: "unverified otp" });
        }


    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
