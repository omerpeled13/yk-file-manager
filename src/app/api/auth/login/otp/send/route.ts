import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';


export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    const formData = await request.formData()
    const email = String(formData.get('email'))

    const supabase = createRouteHandlerClient({ cookies })

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
        console.error("Failed to send email:", error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: "email sent" }, { status: 200 });
}
