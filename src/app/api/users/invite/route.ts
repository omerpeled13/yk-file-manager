import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// ✅ Secure Supabase Admin Client (for server use only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⛔ NEVER expose in frontend
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { email, name, role } = await req.json(); // Expecting { email: "user@example.com", role: "user" }
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    // ✅ Check if the email is already registered
    const { data: existingUsers, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
    if (fetchError) throw new Error(fetchError.message);

    const isEmailRegistered = existingUsers?.users.some((user) => user.email === email);
    if (isEmailRegistered) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    // ✅ Create a new user (without a password)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: false,
    });

    if (error) throw new Error(error.message);
    const userId = data.user?.id;

    // ✅ Store invited user in the "profiles" table
    const { error: dbError } = await supabaseAdmin
      .from("profiles")
      .insert([{ id: userId, email: email, role: role, name: name }]);

    if (dbError) throw new Error(dbError.message);

    return NextResponse.json({ message: "User invited successfully", userId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
