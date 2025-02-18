import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// ✅ Secure admin client (ONLY for server use)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⛔ NEVER expose this in frontend
    { auth: { persistSession: false } }
);

export async function GET() {
    // Create Supabase client with cookies (for authentication)
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //fetch user's profile
    const { data: profile, error: profile_error } = await supabase
        .from("profiles")
        .select("role,client_id")
        .eq("id", user.id)
        .single();

    if (profile_error) {
        return NextResponse.json({ error: profile_error.message }, { status: 500 });
    }

    if (profile.role === "admin") {
        // Fetch all clients
        const { data: clients, error } = await supabase
            .from("clients")
            .select("*")
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ clients });
    }
    else {
        // Fetch only the user's client
        const { data: clients, error } = await supabase
            .from("clients")
            .select("*")
            .eq("id", profile.client_id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ clients });
    }
}

export async function POST(req: Request) {

    try {
        const supabase = createRouteHandlerClient({ cookies });

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        //fetch user profile
        const { data: profile, error: profile_error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
        if (profile_error) {
            return NextResponse.json({ error: profile_error.message }, { status: 500 });
        }

        if (profile.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Create a client
        const formData = await req.formData();

        const name = formData.get("name") as string;

        if (!name) {
            return NextResponse.json({ error: "No name provided" }, { status: 400 });
        }
        //insert into clients table
        const { error: dbError } = await supabase.from('clients').insert({
            name: name,
        })

        if (dbError) throw dbError

        return NextResponse.json({ message: "client added successfully" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { clientId } = await req.json();
        if (!clientId) return NextResponse.json({ error: "you have to specify clientId" }, { status: 400 });
        const supabase = createRouteHandlerClient({ cookies });

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        //fetch user profile
        const { data: profile, error: profile_error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile_error) return NextResponse.json({ error: profile_error.message }, { status: 500 });

        if (profile.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        //delete profiles
        const { data: profilesIds, error: getProfilesIdsError } = await supabase
            .from('profiles')
            .select('id')
            .eq('client_id', clientId)

        if (getProfilesIdsError) throw new Error(getProfilesIdsError.message)

        for (const { id } of profilesIds) {
            // ✅ Delete user from Authentication
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
            if (authError) throw new Error(authError.message);
        }
        //delete profiles
        const { error: deleteProfilesError } = await supabase
            .from('profiles')
            .delete()
            .eq('client_id', clientId)

        console.log(deleteProfilesError)
        if (deleteProfilesError) throw new Error(deleteProfilesError.message)


        //delete storage folder
        const { error: storageError } = await supabase.storage
            .from('files')
            .remove(clientId)

        if (storageError) throw new Error(storageError.message)

        //delete files
        const { error: deleteFilesError } = await supabase
            .from('files')
            .delete()
            .eq('client_id', clientId)

        if (deleteFilesError) throw deleteFilesError

        // Delete from clients
        const { error: dbError } = await supabase
            .from('clients')
            .delete()
            .eq('id', clientId)

        if (dbError) throw dbError
        return NextResponse.json({ message: "Client deleted successfully" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user } } = await supabase.auth.getUser();

        const { clientId, name } = await req.json();

        if (!clientId) return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

        if (profile.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const updates: any = {};
        updates.name = name;

        const { error: updateError } = await supabase
            .from("clients")
            .update(updates)
            .eq("id", clientId);

        if (updateError) throw updateError;

        return NextResponse.json({ message: "Client updated successfully" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


