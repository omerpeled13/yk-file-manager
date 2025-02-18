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


export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
    try {
        const supabase = createRouteHandlerClient({ cookies });

        const { userId: userToDeleteId } = params
        if (!userToDeleteId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

        //confirm the user is authotized
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: profile, error: profile_error } = await supabase
            .from("profiles")
            .select("role,client_id")
            .eq("id", user.id)
            .single();

        if (profile_error) return NextResponse.json({ error: profile_error.message }, { status: 500 });

        if (profile.role === "admin") {
            // ✅ Delete user from Authentication
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userToDeleteId);
            if (authError) throw new Error(authError.message);

            // ✅ Delete user-related data from database (e.g., profiles, orders, etc.)
            const { error: dbError } = await supabase.from("profiles").delete().eq("id", userToDeleteId);
            if (dbError) throw new Error(dbError.message);

            return NextResponse.json({ message: "User deleted successfully" });
        }
        else if (profile.role === "client_admin") {
            // ✅ Delete user from profiles
            
            const { data: profileToDelete, error: profileToDelete_error } = await supabase
                .from("profiles")
                .select("id,role,client_id")
                .eq("id", userToDeleteId)
                .single();

            if (profileToDelete_error) NextResponse.json({ error: profileToDelete_error }, { status: 400 });

            if (!profileToDelete) return NextResponse.json({ error: "problem with profile to delete" }, { status: 400 });

            if (profileToDelete.client_id !== profile.client_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

            if (profileToDelete.id === user.id) return NextResponse.json({ error: "you can't delete your own user" }, { status: 401 });

            //authenticated
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userToDeleteId);
            if (authError) throw new Error(authError.message);

            // ✅ Delete user-related data from database
            const { error: dbError } = await supabase.from("profiles").delete().eq("id", userToDeleteId);
            if (dbError) throw new Error(dbError.message);

            return NextResponse.json({ message: "User deleted successfully" });
        }
        else {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}

//TODO: add an option to change password
// ✅ UPDATE a user by ID
export async function PATCH(req: Request, { params }: { params: { userId: string } }) {
    try {
        const supabase = createRouteHandlerClient({ cookies });

        const { updates } = await req.json(); // Expecting { updates: { field1: value, field2: value } }
        if (!updates) return NextResponse.json({ error: "No update data provided" }, { status: 400 });

        const { userId: userToUpdateId } = params;
        if (!userToUpdateId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

        //confirm the user is authotized
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: profile, error: profile_error } = await supabase
            .from("profiles")
            .select("role,client_id")
            .eq("id", user.id)
            .single();

        if (profile_error) return NextResponse.json({ error: profile_error.message }, { status: 500 });
        
        if (profile.role === "admin") {
            // ✅ Update user profile in the database
            const supabase = createRouteHandlerClient({ cookies });
            const { error } = await supabase.from("profiles").update(updates.profileUpdates).eq("id", userToUpdateId);
            if (error) throw new Error(error.message);
            return NextResponse.json({ message: "User updated successfully" });
        }
        else if (profile.role === "client_admin") {

            const { data: profileToUpdate, error: profileToUpdate_error } = await supabaseAdmin
                .from("profiles")
                .select("id,role,client_id")
                .eq("id", userToUpdateId)
                .single();

            if (profileToUpdate_error) return NextResponse.json({ error: profileToUpdate_error }, { status: 400 });

            if (!profileToUpdate) return NextResponse.json({ error: "problem with profile to update" }, { status: 400 });

            if (profileToUpdate.client_id !== profile.client_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

            if (profileToUpdate.id === user.id) return NextResponse.json({ error: "you can't delete your own user" }, { status: 401 });

            //authenticated
            // ✅ Update user profile in the database
            const { error:prodileError } = await supabase.from("profiles").update(updates).eq("id", userToUpdateId);
            if (prodileError) throw new Error(prodileError.message);

            const { error:authError } = await supabase.auth.updateUser(updates.authUpdates);
            if (authError) throw new Error(authError.message);

            return NextResponse.json({ message: "User updated successfully" });


        }
        else {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
