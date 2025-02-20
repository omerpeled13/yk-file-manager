import { createClient } from "@supabase/supabase-js";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// ✅ Secure Supabase Admin Client (for server use only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⛔ NEVER expose in frontend
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {

  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { email, password, name, client_id, role } = await req.json();
    // ✅ Validate input
    if (!email || !password || !name || !client_id || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }


    //confirm the user is authotized
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profile_error } = await supabase
      .from("profiles")
      .select("role,client_id")
      .eq("id", user.id)
      .single();

    if (profile_error) return NextResponse.json({ error: profile_error.message }, { status: 500 });

    if (profile.role !== 'admin' && profile.role !== 'client_admin') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (profile.role === 'client_admin' && profile.client_id !== client_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // ✅ Create a new user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Automatically confirm the email
    });

    if (authError) throw new Error(authError.message);

    if (!authData.user) throw new Error("unexpected error - user object is empty");

    const userId = authData.user.id;

    let client_id_to_set = client_id
    if (role === "admin") { client_id_to_set = null }
    // ✅ Insert user data into "profiles" table
    const { error: dbError } = await supabase.from("profiles").insert([
      { id: userId, email, name, client_id: client_id_to_set, role }
    ]);

    if (dbError) throw new Error(dbError.message);

    return NextResponse.json({ message: "User signed up successfully", userId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
