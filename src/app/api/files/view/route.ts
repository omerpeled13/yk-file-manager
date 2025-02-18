import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const fileUrl = request?.nextUrl?.searchParams.get('fileUrl')

        if (!fileUrl) {
            return NextResponse.json({ error: "File path is required" }, { status: 400 });
        }
        const { data, error } = await supabase.storage
            .from('files')
            .createSignedUrl(fileUrl, 20)
        if (error) throw error
        return NextResponse.json({ url: data.signedUrl });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
