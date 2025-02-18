import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";


export async function GET() {
    // Create Supabase client with cookies (for authentication)
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profile_error } = await supabase
        .from("profiles")
        .select("role,client_id")
        .eq("id", user.id)
        .single();

    if (profile_error) {
        return NextResponse.json({ error: profile_error.message }, { status: 500 });
    }

    if (profile.role === "admin") {
        // Fetch all profiles
        const { data: profiles, error: profiles_error } = await supabase
            .from("profiles")
            .select("id,name,email,created_at,role,confirmed,client:clients!client_id(name,id)")

        if (profiles_error) {
            return NextResponse.json({ error: profiles_error.message }, { status: 500 });
        }

        return NextResponse.json({ profiles });
    }
    else if (profile.role === "client_admin") {
        // Fetch client associated profiles
        const { data: profiles, error: profiles_error } = await supabase
            .from("profiles")
            .select("*")
            .eq("client_id", profile.client_id)

        if (profiles_error) {
            return NextResponse.json({ error: profiles_error.message }, { status: 500 });
        }

        return NextResponse.json({ profiles });
    }
    else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


}
