import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
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

        // ✅ Get file path from query params
        const fileUrl = request?.nextUrl?.searchParams.get("fileUrl");
        if (!fileUrl) {
            return NextResponse.json({ error: "File path is required" }, { status: 400 });
        }

        // ✅ Download file from Supabase storage
        const { data, error } = await supabase.storage.from("files").download(fileUrl);
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // ✅ Return file as a binary response
        return new Response(data, {
            status: 200,
            headers: {
                "Content-Type": data.type, // Auto-detect content type (e.g., image/png, application/pdf)
                "Content-Disposition": `attachment; filename="${fileUrl.split("/").pop()}"`,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
