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


export async function DELETE(request: Request, { params }: { params: { userId: string } }
) {
    try {
        const { userId } = params
        if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

        // ✅ Delete user from Authentication
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) throw new Error(authError.message);

        // ✅ Delete user-related data from database (e.g., profiles, orders, etc.)
        const supabase = createRouteHandlerClient({ cookies });
        const { error: dbError } = await supabase.from("profiles").delete().eq("id", userId);
        if (dbError) throw new Error(dbError.message);

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}

// ✅ UPDATE a user by ID
export async function PATCH(req: Request, { params }: { params: { userId: string } }) {
    try {
        const userId = params;
        if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

        const { updates } = await req.json(); // Expecting { updates: { field1: value, field2: value } }
        if (!updates) return NextResponse.json({ error: "No update data provided" }, { status: 400 });

        // ✅ Update user profile in the database
        const supabase = createRouteHandlerClient({ cookies });
        const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
        if (error) throw new Error(error.message);

        return NextResponse.json({ message: "User updated successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
