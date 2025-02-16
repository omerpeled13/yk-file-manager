import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {

    //TODO: check if authenticated
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { fileUrl } = await req.json();
        if (!fileUrl) {
            return NextResponse.json({ error: "File path and name are required" }, { status: 400 });
        }

        const { data, error } = await supabase.storage
            .from('files')
            .download(fileUrl)

        if (error) throw error
        return NextResponse.json({ url: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
