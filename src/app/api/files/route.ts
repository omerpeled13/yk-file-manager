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
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile_error) {
        return NextResponse.json({ error: profile_error.message }, { status: 500 });
    }

    if (profile.role === "admin") {
        // Fetch all files
        const { data: files, error } = await supabase
            .from("files")
            .select("id,name,file_url, user:profiles!user_id(name,id), uploaded_by:profiles!uploaded_by(name), file_type, created_at, file_size, description")
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ files });
    }
    else if (profile.role === "client") {
        // Fetch files belongs to the user
        const { data: files, error } = await supabase
            .from("files")
            .select("*")
            .eq("user_id", user.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ files });
    }
    else {
        return NextResponse.json({ error: "profile error" }, { status: 500 });
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

        const { data: profile, error: profile_error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (profile_error) {
            return NextResponse.json({ error: profile_error.message }, { status: 500 });
        }

        if (profile.role === "admin") {

            // Create a unique file name
            const formData = await req.formData();
            const file = formData.get("file") as File;
            const userId = formData.get("userId") as string;
            const displayName = formData.get("displayName") as string;
            const description = formData.get("description") as string;
            const timestamp = Date.now()
            const fileExt = file.name.split('.').pop()
            const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${userId}/${fileName}`


            if (!file) {
                return NextResponse.json({ error: "No file provided" }, { status: 400 });
            }

            // Upload file to Supabase Storage
            const { data: storageData, error: storageError } = await supabase.storage
                .from('files')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (storageError) throw storageError

            const { error: dbError } = await supabase.from('files').insert({
                name: displayName,
                file_url: filePath,
                file_type: file.type,
                file_size: file.size,
                uploaded_by: (await supabase.auth.getUser()).data.user?.id,
                user_id: userId,
                description: description,
            })

            if (dbError) throw dbError

            return NextResponse.json({ message: "File uploaded successfully", filePath, url: storageData.path });

        }
        else {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}

export async function DELETE(req: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { fileId, fileUrl } = await req.json();
        console.log(fileId, fileUrl)
        if (!fileUrl) {
            return NextResponse.json({ error: "File path is required" }, { status: 400 });
        }

        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('files')
            .remove([fileUrl])

        if (storageError) throw new Error(storageError.message)

        // Delete from database
        const { error: dbError } = await supabase
            .from('files')
            .delete()
            .eq('id', fileId)

        if (dbError) throw dbError
        return NextResponse.json({ message: "File deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { id, name, description } = await req.json();

        if (!id) return NextResponse.json({ error: "File ID is required" }, { status: 400 });

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

        if (profile.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const updates: any = {};
        if (name) updates.name = name;
        if (description) updates.description = description;

        const { error: updateError } = await supabase
            .from("files")
            .update(updates)
            .eq("id", id);

        if (updateError) throw updateError;

        return NextResponse.json({ message: "File updated successfully" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


